package com.resumeai.resumebuilder;

import com.resumeai.common.exception.BadRequestException;
import com.resumeai.common.exception.ResourceNotFoundException;
import com.resumeai.resumebuilder.dto.ResumeBuilderRequest;
import com.resumeai.resumebuilder.dto.ResumeBuilderResponse;
import com.resumeai.subscription.PlanType;
import com.resumeai.subscription.SubscriptionService;
import com.resumeai.template.ResumeTemplate;
import com.resumeai.template.ResumeTemplateService;
import com.resumeai.user.User;
import com.resumeai.user.UserService;
import com.resumeai.usagelimit.UserUsageLimit;
import com.resumeai.usagelimit.UserUsageLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeBuilderService {

    private final UserGeneratedResumeRepository userGeneratedResumeRepository;
    private final ResumeTemplateService resumeTemplateService;
    private final ResumeBuilderRenderer resumeBuilderRenderer;
    private final UserService userService;
    private final SubscriptionService subscriptionService;
    private final UserUsageLimitService userUsageLimitService;

    public List<ResumeBuilderResponse> getMyResumes() {
        User user = userService.getCurrentUser();
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = planType != PlanType.FREE;
        return userGeneratedResumeRepository.findByUserOrderByUpdatedAtDesc(user)
                .stream()
                .map(resume -> ResumeBuilderResponse.from(
                        resume,
                        planType,
                        premium || resume.getEditCount() < 1,
                        !premium
                ))
                .toList();
    }

    public ResumeBuilderResponse getResume(Long resumeId) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = planType != PlanType.FREE;
        return ResumeBuilderResponse.from(resume, planType, premium || resume.getEditCount() < 1, !premium);
    }

    @Transactional
    public ResumeBuilderResponse createResume(ResumeBuilderRequest request) {
        User user = userService.getCurrentUser();
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = planType != PlanType.FREE;

        if (!premium && userGeneratedResumeRepository.countByUser(user) >= 1) {
            throw new BadRequestException("Free plan supports only 1 created resume. Upgrade for more.");
        }

        ResumeTemplate template = resumeTemplateService.getTemplate(request.templateId());
        if (template.isPremium() && !premium) {
            throw new BadRequestException("This ATS-friendly template is premium. Upgrade to continue.");
        }

        String generatedHtml = resumeBuilderRenderer.render(
                request.title(),
                request.resumeDataJson(),
                !premium,
                template.getHtmlTemplateContent()
        );
        UserGeneratedResume saved = userGeneratedResumeRepository.save(UserGeneratedResume.builder()
                .user(user)
                .template(template)
                .title(request.title().trim())
                .themeJson("{}")
                .status(ResumeEditorStatus.READY)
                .resumeDataJson(request.resumeDataJson())
                .generatedHtml(generatedHtml)
                .generatedPdfUrl(null)
                .editCount(0)
                .downloadCount(0)
                .build());

        return ResumeBuilderResponse.from(saved, planType, true, !premium);
    }

    @Transactional
    public ResumeBuilderResponse updateResume(Long resumeId, ResumeBuilderRequest request) {
        User user = userService.getCurrentUser();
        UserGeneratedResume resume = getOwnedResume(resumeId, user);
        PlanType planType = subscriptionService.resolvePlan(user);
        boolean premium = planType != PlanType.FREE;

        if (!premium && resume.getEditCount() >= 1) {
            throw new BadRequestException("Free plan allows only 1 edit. Upgrade for unlimited editing.");
        }

        ResumeTemplate template = resumeTemplateService.getTemplate(request.templateId());
        if (template.isPremium() && !premium) {
            throw new BadRequestException("This ATS-friendly template is premium. Upgrade to continue.");
        }

        resume.setTemplate(template);
        resume.setTitle(request.title().trim());
        if (resume.getThemeJson() == null) {
            resume.setThemeJson("{}");
        }
        if (resume.getStatus() == null) {
            resume.setStatus(ResumeEditorStatus.READY);
        }
        resume.setResumeDataJson(request.resumeDataJson());
        resume.setGeneratedHtml(resumeBuilderRenderer.render(
                request.title(),
                request.resumeDataJson(),
                !premium,
                template.getHtmlTemplateContent()
        ));
        resume.setEditCount(resume.getEditCount() + 1);

        UserGeneratedResume saved = userGeneratedResumeRepository.save(resume);
        if (!premium) {
            userUsageLimitService.incrementFreeEditUsageIfNeeded(user);
        }

        return ResumeBuilderResponse.from(saved, planType, premium || saved.getEditCount() < 1, !premium);
    }

    public UserGeneratedResume getOwnedResume(Long resumeId, User user) {
        return userGeneratedResumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Generated resume not found: " + resumeId));
    }
}
