package com.moonseptstudio.mutualt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MutualtApplication {

    public static void main(String[] args) {
        SpringApplication.run(MutualtApplication.class, args);
    }

}
