package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmer_media")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FarmerMedia {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "media_type", nullable = false)
    private String mediaType;

    @Column(name = "file_url", nullable = false)
    private String url;

    @Column(name = "caption")
    private String caption;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
