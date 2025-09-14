package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    private final Map<String, String> otpCache = new HashMap<>();

    public String generateOtp(String key) {
        Random random = new Random();
        String otp = String.format("%06d", random.nextInt(1000000));
        otpCache.put(key, otp);
        return otp;
    }

    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP code is: " + otp);
        mailSender.send(message);
    }

    public boolean validateOtp(String key, String otp) {
        return otp.equals(otpCache.get(key));
    }
}
