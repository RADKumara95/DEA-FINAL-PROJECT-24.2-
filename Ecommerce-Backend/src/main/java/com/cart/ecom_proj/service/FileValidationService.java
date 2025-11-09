package com.cart.ecom_proj.service;

import com.cart.ecom_proj.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;

@Service
public class FileValidationService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
    );

    public void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return; 
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum allowed size of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPG, PNG, and WEBP images are allowed");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("File name is required");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed");
        }

        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            if (img == null) {
                throw new BadRequestException("Uploaded file is not a valid image");
            }
            int width = img.getWidth();
            int height = img.getHeight();
            int maxDim = 8000; 
            if (width > maxDim || height > maxDim) {
                throw new BadRequestException("Image dimensions are too large");
            }
        } catch (IOException e) {
            throw new BadRequestException("Unable to read image file");
        }
    }
}

