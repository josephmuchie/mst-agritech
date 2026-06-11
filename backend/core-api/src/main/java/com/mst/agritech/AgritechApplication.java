package com.mst.agritech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AgritechApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgritechApplication.class, args);
    }
}
