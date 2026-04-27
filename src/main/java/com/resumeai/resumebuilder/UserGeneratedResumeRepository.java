package com.resumeai.resumebuilder;

import com.resumeai.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserGeneratedResumeRepository extends JpaRepository<UserGeneratedResume, Long> {

    List<UserGeneratedResume> findByUserOrderByUpdatedAtDesc(User user);

    Optional<UserGeneratedResume> findByIdAndUser(Long id, User user);

    long countByUser(User user);
}
