package com.resumeai.resumebuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeai.common.exception.BadRequestException;
import com.resumeai.common.exception.ResourceNotFoundException;
import com.resumeai.resumebuilder.dto.*;
import com.resumeai.subscription.PlanType;
import com.resumeai.subscription.SubscriptionService;
import com.resumeai.template.ResumeTemplate;
import com.resumeai.template.ResumeTemplateService;
import com.resumeai.template.ResumeTemplateRepository;
import com.resumeai.user.User;
import com.resumeai.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ResumeEditorService {

    private static final String DEFAULT_THEME_JSON = """
            {
              "headerColor": "#284b8f",
              "primaryColor": "#1E3A5F",
              "fontFamily": "Poppins",
              "headerFontSize": 22,
              "bodyFontSize": 12,
              "sectionStyle": "underline",
              "layout": "single-column"
            }
            """;

    private final UserGeneratedResumeRepository userGeneratedResumeRepository;
    private final ResumeSectionRepository resumeSectionRepository;
    private final SectionTemplateRepository sectionTemplateRepository;
    private final ResumeTemplateService resumeTemplateService;
    private final ResumeTemplateRepository resumeTemplateRepository;
    private final ResumeBuilderRenderer resumeBuilderRenderer;
    private final UserService userService;
    private final SubscriptionService subscriptionService;
    private final TemplateChangeHistoryRepository templateChangeHistoryRepository;
    private final ObjectMapper objectMapper;

    public List<ResumeEditorResponse> getMyResumes() {
        User user = userService.getCurrentUser();
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);
        return userGeneratedResumeRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .map(resume -> toResponse(resume, planType, premium))
                .toList();
    }

    public ResumeEditorResponse getResume(Long resumeId) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        return toResponse(resume, planType, isPremium(planType));
    }

    @Transactional
    public ResumeEditorResponse createResume(ResumeEditorCreateRequest request) {
        User user = userService.getCurrentUser();
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        if (!premium && userGeneratedResumeRepository.countByUser(user) >= 1) {
          throw new BadRequestException("Free plan supports only 1 created resume. Upgrade for more.");
        }

        ResumeTemplate template = validateTemplateAccess(request.templateId(), premium);
        UserGeneratedResume resume = userGeneratedResumeRepository.save(UserGeneratedResume.builder()
                .user(user)
                .template(template)
                .title(request.title().trim())
                .themeJson(compactJson(DEFAULT_THEME_JSON))
                .status(ResumeEditorStatus.DRAFT)
                .resumeDataJson("{}")
                .generatedHtml("")
                .generatedPdfUrl(null)
                .editCount(0)
                .downloadCount(0)
                .build());

        seedDefaultSections(resume, premium);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse updateResume(Long resumeId, ResumeEditorUpdateRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        ResumeTemplate template = validateTemplateAccess(request.templateId(), premium);
        recordTemplateChange(resume, template.getId());
        resume.setTemplate(template);
        resume.setTitle(request.title().trim());
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse switchTemplate(Long resumeId, ResumeTemplateSwitchRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        ResumeTemplate template = validateTemplateAccess(request.templateId(), premium);
        recordTemplateChange(resume, template.getId());
        resume.setTemplate(template);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }


    @Transactional
    public ResumeEditorResponse duplicateResume(Long resumeId) {
        User user = userService.getCurrentUser();
        UserGeneratedResume source = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        if (!premium && userGeneratedResumeRepository.countByUser(user) >= 1) {
            throw new BadRequestException("Free plan supports only 1 created resume. Upgrade for more.");
        }

        UserGeneratedResume copy = userGeneratedResumeRepository.save(UserGeneratedResume.builder()
                .user(user)
                .template(source.getTemplate())
                .title(source.getTitle() + " Copy")
                .themeJson(source.getThemeJson())
                .status(ResumeEditorStatus.DRAFT)
                .resumeDataJson(source.getResumeDataJson())
                .generatedHtml(source.getGeneratedHtml())
                .generatedPdfUrl(null)
                .editCount(0)
                .downloadCount(0)
                .build());

        List<ResumeSection> sourceSections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(source);
        List<ResumeSection> copiedSections = new ArrayList<>();
        for (ResumeSection sourceSection : sourceSections) {
            copiedSections.add(ResumeSection.builder()
                    .resume(copy)
                    .sectionType(sourceSection.getSectionType())
                    .sectionTitle(sourceSection.getSectionTitle())
                    .sectionOrder(sourceSection.getSectionOrder())
                    .visible(sourceSection.isVisible())
                    .contentJson(sourceSection.getContentJson())
                    .build());
        }
        resumeSectionRepository.saveAll(copiedSections);

        refreshRenderedState(copy, premium);
        return toResponse(copy, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse importResume(MultipartFile file, Long templateId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is required");
        }

        User user = userService.getCurrentUser();
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        if (!premium && userGeneratedResumeRepository.countByUser(user) >= 1) {
            throw new BadRequestException("Free plan supports only 1 created resume. Upgrade for more.");
        }

        ResumeTemplate template = templateId == null
                ? resumeTemplateRepository.findAll().stream().filter(item -> !item.isPremium()).findFirst()
                    .orElseThrow(() -> new BadRequestException("No free template is configured"))
                : validateTemplateAccess(templateId, premium);

        String extractedText;
        try {
            extractedText = new String(file.getBytes());
        } catch (Exception exception) {
            throw new BadRequestException("Failed to read uploaded file");
        }

        UserGeneratedResume resume = userGeneratedResumeRepository.save(UserGeneratedResume.builder()
                .user(user)
                .template(template)
                .title("Imported Resume")
                .themeJson(compactJson(DEFAULT_THEME_JSON))
                .status(ResumeEditorStatus.DRAFT)
                .resumeDataJson("{}")
                .generatedHtml("")
                .generatedPdfUrl(null)
                .editCount(0)
                .downloadCount(0)
                .build());

        seedDefaultSections(resume, premium);
        List<ResumeSection> sections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume);
        sections.stream()
                .filter(section -> "SUMMARY".equalsIgnoreCase(section.getSectionType()))
                .findFirst()
                .ifPresent(section -> {
                    section.setContentJson(compactJson("{\"text\":\"" + escapeJson(extractedText.substring(0, Math.min(1200, extractedText.length()))) + "\"}"));
                    resumeSectionRepository.save(section);
                });

        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }


    @Transactional
    public void deleteResume(Long resumeId) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        resumeSectionRepository.deleteByResume(resume);
        userGeneratedResumeRepository.delete(resume);
    }

    public List<ResumeSectionResponse> getSections(Long resumeId) {
        UserGeneratedResume resume = getOwnedResume(resumeId, userService.getCurrentUser());
        return resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume).stream()
                .map(ResumeSectionResponse::from)
                .toList();
    }

    @Transactional
    public ResumeEditorResponse addSection(Long resumeId, ResumeSectionRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        validateSectionAccess(request.sectionType(), premium);
        List<ResumeSection> sections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume);
        ResumeSection saved = resumeSectionRepository.save(ResumeSection.builder()
                .resume(resume)
                .sectionType(request.sectionType().trim().toUpperCase())
                .sectionTitle(request.sectionTitle().trim())
                .sectionOrder(sections.size() + 1)
                .visible(Boolean.TRUE.equals(request.isVisible()))
                .contentJson(compactJson(request.contentJson()))
                .build());
        sections.add(saved);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse updateSection(Long resumeId, Long sectionId, ResumeSectionRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        ResumeSection section = getOwnedSection(resume, sectionId);
        validateSectionAccess(request.sectionType(), premium);
        section.setSectionType(request.sectionType().trim().toUpperCase());
        section.setSectionTitle(request.sectionTitle().trim());
        section.setVisible(Boolean.TRUE.equals(request.isVisible()));
        section.setContentJson(compactJson(request.contentJson()));
        resumeSectionRepository.save(section);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse deleteSection(Long resumeId, Long sectionId) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        ResumeSection section = getOwnedSection(resume, sectionId);
        resumeSectionRepository.delete(section);
        normalizeOrders(resume);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse reorderSections(Long resumeId, ResumeSectionReorderRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        Map<Long, Integer> orderMap = new LinkedHashMap<>();
        request.items().forEach(item -> orderMap.put(item.sectionId(), item.sectionOrder()));
        List<ResumeSection> sections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume);
        sections.forEach(section -> {
            Integer order = orderMap.get(section.getId());
            if (order != null) {
                section.setSectionOrder(order);
            }
        });
        resumeSectionRepository.saveAll(sections);
        normalizeOrders(resume);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    @Transactional
    public ResumeEditorResponse updateSectionVisibility(Long resumeId, Long sectionId, ResumeSectionVisibilityRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        ResumeSection section = getOwnedSection(resume, sectionId);
        section.setVisible(Boolean.TRUE.equals(request.isVisible()));
        resumeSectionRepository.save(section);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    public String getTheme(Long resumeId) {
        UserGeneratedResume resume = getOwnedResume(resumeId, userService.getCurrentUser());
        return resume.getThemeJson();
    }

    @Transactional
    public ResumeEditorResponse updateTheme(Long resumeId, ResumeThemeUpdateRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);

        if (!premium) {
            throw new BadRequestException("Theme customization is available only on premium plans.");
        }

        resume.setThemeJson(compactJson(request.themeJson()));
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    public List<SectionTemplateResponse> getSectionTemplates() {
        PlanType planType = subscriptionService.resolvePlan(userService.getCurrentUser());
        boolean premium = isPremium(planType);
        return sectionTemplateRepository.findAllByOrderByDisplayOrderAsc().stream()
                .filter(template -> premium || !template.isPremium())
                .map(SectionTemplateResponse::from)
                .toList();
    }

    public ResumeEditorResponse preview(Long resumeId) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = isPremium(planType);
        refreshRenderedState(resume, premium);
        return toResponse(resume, planType, premium);
    }

    public UserGeneratedResume getOwnedResume(Long resumeId, User user) {
        return userGeneratedResumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Generated resume not found: " + resumeId));
    }

    private ResumeTemplate validateTemplateAccess(Long templateId, boolean premium) {
        ResumeTemplate template = resumeTemplateService.getTemplate(templateId);
        if (template.isPremium() && !premium) {
            throw new BadRequestException("This template is premium. Upgrade to continue.");
        }
        return template;
    }

    private ResumeSection getOwnedSection(UserGeneratedResume resume, Long sectionId) {
        return resumeSectionRepository.findByIdAndResume(sectionId, resume)
                .orElseThrow(() -> new ResourceNotFoundException("Resume section not found: " + sectionId));
    }

    private void seedDefaultSections(UserGeneratedResume resume, boolean premium) {
        List<SectionTemplate> defaults = sectionTemplateRepository.findAllByOrderByDisplayOrderAsc().stream()
                .filter(SectionTemplate::isDefaultSection)
                .filter(template -> premium || !template.isPremium())
                .toList();

        List<ResumeSection> sections = new ArrayList<>();
        for (int index = 0; index < defaults.size(); index++) {
            SectionTemplate template = defaults.get(index);
            sections.add(ResumeSection.builder()
                    .resume(resume)
                    .sectionType(template.getSectionType())
                    .sectionTitle(template.getTitle())
                    .sectionOrder(index + 1)
                    .visible(true)
                    .contentJson(template.getDefaultContentJson())
                    .build());
        }
        resumeSectionRepository.saveAll(sections);
    }

    private void validateSectionAccess(String sectionType, boolean premium) {
        String normalized = sectionType.trim().toUpperCase();
        SectionTemplate template = sectionTemplateRepository.findBySectionType(normalized)
                .orElseThrow(() -> new BadRequestException("Unknown section type: " + sectionType));
        if (template.isPremium() && !premium) {
            throw new BadRequestException("This section is premium. Upgrade to continue.");
        }
        if ("CUSTOM".equals(normalized) && !premium) {
            throw new BadRequestException("Custom sections are available only on premium plans.");
        }
    }

    private void normalizeOrders(UserGeneratedResume resume) {
        List<ResumeSection> sections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume);
        for (int index = 0; index < sections.size(); index++) {
            sections.get(index).setSectionOrder(index + 1);
        }
        resumeSectionRepository.saveAll(sections);
    }

    private ResumeEditorResponse toResponse(UserGeneratedResume resume, PlanType planType, boolean premium) {
        List<ResumeSection> sections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume);
        return ResumeEditorResponse.from(
                resume,
                sections,
                planType,
                true,
                !premium,
                resolveUnsupportedSectionTitles(resume.getTemplate(), sections)
        );
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace(""", "\\"").replace("\n", " ").replace("\r", " ").trim();
    }

    private void refreshRenderedState(UserGeneratedResume resume, boolean premium) {
        List<ResumeSection> sections = resumeSectionRepository.findByResumeOrderBySectionOrderAsc(resume);
        String snapshotJson = buildSnapshotJson(resume, sections);
        Set<String> supportedSections = resolveSupportedSections(resume.getTemplate());
        List<ResumeSection> renderableSections = sections.stream()
                .filter(section -> supportedSections.contains(normalizeSectionType(section.getSectionType())))
                .toList();
        resume.setResumeDataJson(snapshotJson);
        resume.setGeneratedHtml(resumeBuilderRenderer.renderDynamic(
                resume.getTitle(),
                compactJson(resume.getThemeJson()),
                renderableSections,
                !premium,
                resume.getTemplate().getHtmlTemplateContent()
        ));
        resume.setStatus(ResumeEditorStatus.READY);
        userGeneratedResumeRepository.save(resume);
    }

    private String buildSnapshotJson(UserGeneratedResume resume, List<ResumeSection> sections) {
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            root.put("title", resume.getTitle());
            root.put("theme", parseJson(resume.getThemeJson()));
            List<Map<String, Object>> sectionPayload = new ArrayList<>();
            for (ResumeSection section : sections) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", section.getId());
                item.put("sectionType", section.getSectionType());
                item.put("sectionTitle", section.getSectionTitle());
                item.put("sectionOrder", section.getSectionOrder());
                item.put("isVisible", section.isVisible());
                item.put("content", parseJson(section.getContentJson()));
                sectionPayload.add(item);
            }
            root.put("sections", sectionPayload);
            return objectMapper.writeValueAsString(root);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Failed to build resume snapshot JSON.");
        }
    }

    private Object parseJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new BadRequestException("Invalid JSON content supplied.");
        }
    }

    private String compactJson(String json) {
        try {
            Object value = objectMapper.readValue(json, Object.class);
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new BadRequestException("Invalid JSON content supplied.");
        }
    }

    private boolean isPremium(PlanType planType) {
        return planType != PlanType.FREE;
    }

    private void recordTemplateChange(UserGeneratedResume resume, Long newTemplateId) {
        Long oldTemplateId = resume.getTemplate().getId();
        if (oldTemplateId.equals(newTemplateId)) {
            return;
        }
        templateChangeHistoryRepository.save(TemplateChangeHistory.builder()
                .resumeId(resume.getId())
                .oldTemplateId(oldTemplateId)
                .newTemplateId(newTemplateId)
                .build());
    }

    private List<String> resolveUnsupportedSectionTitles(ResumeTemplate template, List<ResumeSection> sections) {
        Set<String> supported = resolveSupportedSections(template);
        return sections.stream()
                .filter(section -> !supported.contains(normalizeSectionType(section.getSectionType())))
                .sorted(Comparator.comparingInt(ResumeSection::getSectionOrder))
                .map(ResumeSection::getSectionTitle)
                .distinct()
                .toList();
    }

    private Set<String> resolveSupportedSections(ResumeTemplate template) {
        try {
            List<String> sections = objectMapper.readValue(template.getSupportedSectionsJson(), new TypeReference<>() {
            });
            Set<String> normalized = new LinkedHashSet<>();
            sections.forEach(value -> normalized.add(normalizeSectionType(value)));
            return normalized;
        } catch (Exception ignored) {
            return Set.of("SUMMARY", "EXPERIENCE", "SKILLS", "EDUCATION", "PROJECTS", "CERTIFICATIONS", "COURSES", "LANGUAGES");
        }
    }

    private String normalizeSectionType(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
