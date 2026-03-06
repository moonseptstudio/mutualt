package com.moonseptstudio.mutualt.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/public/files")
public class FileController {

    private final Path root = Paths.get("uploads");

    @GetMapping("/{subDir}/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String subDir, @PathVariable String filename) {
        try {
            Path file = root.resolve(subDir).resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (filename.toLowerCase().endsWith(".pdf"))
                    contentType = "application/pdf";
                else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg"))
                    contentType = "image/jpeg";
                else if (filename.toLowerCase().endsWith(".png"))
                    contentType = "image/png";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
