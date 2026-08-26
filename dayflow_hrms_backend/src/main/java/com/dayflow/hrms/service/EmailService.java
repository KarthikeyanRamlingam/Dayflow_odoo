package com.dayflow.hrms.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        log.info("[EMAIL NOTIFICATION] To: {} | Subject: {} | Message: {}", to, subject, body);
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("notifications@dayflow.local");
                mailSender.send(message);
                log.info("[EMAIL SENT] Successfully sent email to {}", to);
            } catch (Exception e) {
                log.warn("[EMAIL WARN] Could not deliver email via SMTP (running in local simulation mode): {}", e.getMessage());
            }
        }
    }

    public void sendLeaveStatusNotification(String to, String employeeName, String status, String reviewComment) {
        String subject = "Dayflow HRMS: Leave Request " + status;
        String body = String.format(
                "Hello %s,\n\nYour leave request has been %s.\nReview remarks: %s\n\nBest regards,\nDayflow HR Operations Team",
                employeeName, status, (reviewComment != null && !reviewComment.isBlank()) ? reviewComment : "None"
        );
        sendEmail(to, subject, body);
    }

    public void sendWelcomeNotification(String to, String employeeName, String employeeCode) {
        String subject = "Welcome to Dayflow HRMS";
        String body = String.format(
                "Hello %s,\n\nWelcome to the team! Your employee profile (%s) has been successfully created in Dayflow HRMS.\n\nBest regards,\nDayflow HR Operations Team",
                employeeName, employeeCode
        );
        sendEmail(to, subject, body);
    }
}
