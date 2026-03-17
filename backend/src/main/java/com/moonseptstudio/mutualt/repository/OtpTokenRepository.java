package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByPhoneNumberAndOtpCodeAndType(String phoneNumber, String otpCode, String type);
    void deleteByPhoneNumberAndType(String phoneNumber, String type);
    
    Optional<OtpToken> findByEmailAndOtpCodeAndType(String email, String otpCode, String type);
    void deleteByEmailAndType(String email, String type);
}
