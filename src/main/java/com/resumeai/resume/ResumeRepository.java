package com.resumeai.resume;

import com.resumeai.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserOrderByCreatedAtDesc(User user);

    Optional<Resume> findByIdAndUser(Long id, User user);
}
