package com.resumeai.resume;

import com.resumeai.common.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class PdfResumeParser {

    public String extractText(File file) {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null || text.isBlank()) {
                throw new BadRequestException("Uploaded PDF does not contain readable text");
            }
            return text.trim();
        } catch (IOException exception) {
            throw new BadRequestException("Failed to parse PDF: " + exception.getMessage());
        }
    }
}
