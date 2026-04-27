package com.resumeai.usagelimit;

import com.resumeai.usagelimit.dto.UserUsageLimitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usage-limit")
@RequiredArgsConstructor
public class UserUsageLimitController {

    private final UserUsageLimitService userUsageLimitService;

    @GetMapping("/me")
    public UserUsageLimitResponse me() {
        return userUsageLimitService.getCurrentUsage();
    }
}
