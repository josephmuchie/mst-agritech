package com.mst.agritech.repository;

import com.mst.agritech.domain.entity.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppSettingRepository extends JpaRepository<AppSetting, Long> {
    Optional<AppSetting> findBySettingKey(String settingKey);
    List<AppSetting> findBySettingKeyStartingWith(String prefix);
}
