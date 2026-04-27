package com.resumeai.template;

import com.resumeai.config.AppProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
public class TemplateAssetStorageService {

    private final Path templatePreviewDir;

    public TemplateAssetStorageService(AppProperties properties) throws IOException {
        String configuredUploadDir = Optional.ofNullable(properties.getStorage().getUploadDir())
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElse("uploads");
        this.templatePreviewDir = Path.of(configuredUploadDir, "template-previews").toAbsolutePath().normalize();
        Files.createDirectories(templatePreviewDir);
    }

    public String storePreviewImage(MultipartFile file) {
        String originalName = file.getOriginalFilename() == null ? "template-preview.png" : file.getOriginalFilename();
        String storedName = UUID.randomUUID() + "-" + originalName.replaceAll("\\s+", "_");
        Path destination = templatePreviewDir.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/template-previews/" + storedName;
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store template preview image", exception);
        }
    }
}
