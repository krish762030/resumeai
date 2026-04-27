package com.resumeai.resume;

import com.resumeai.common.exception.BadRequestException;
import com.resumeai.common.exception.ResourceNotFoundException;
import com.resumeai.resume.dto.ResumeResponse;
import com.resumeai.user.User;
import com.resumeai.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final PdfResumeParser pdfResumeParser;

    public ResumeResponse upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Resume file is required");
        }
        if (!isPdf(file.getOriginalFilename(), file.getContentType())) {
            throw new BadRequestException("Only PDF resumes are supported in the MVP");
        }

        User user = userService.getCurrentUser();
        Path storedPath = fileStorageService.storeResume(file);
        String extractedText = pdfResumeParser.extractText(new File(storedPath.toString()));

        Resume resume = resumeRepository.save(Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileUrl(storedPath.toString())
                .extractedText(extractedText)
                .status(ResumeStatus.PARSED)
                .build());

        return ResumeResponse.from(resume);
    }

    public Resume getOwnedResume(Long resumeId) {
        User user = userService.getCurrentUser();
        return resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
    }

    public ResumeResponse getResume(Long resumeId) {
        return ResumeResponse.from(getOwnedResume(resumeId));
    }

    public List<ResumeResponse> getResumes() {
        User user = userService.getCurrentUser();
        return resumeRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(ResumeResponse::from)
                .toList();
    }

    private boolean isPdf(String fileName, String contentType) {
        return (fileName != null && fileName.toLowerCase().endsWith(".pdf"))
                || "application/pdf".equalsIgnoreCase(contentType);
    }
}
