package com.resumeai.usagelimit;

import com.resumeai.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserUsageLimitRepository extends JpaRepository<UserUsageLimit, Long> {

    Optional<UserUsageLimit> findByUser(User user);
}
