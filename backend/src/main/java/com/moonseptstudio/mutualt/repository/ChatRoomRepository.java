package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.ChatRoom;
import com.moonseptstudio.mutualt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @EntityGraph(attributePaths = {"members"})
    @Query("SELECT r FROM ChatRoom r JOIN r.members m WHERE m = :user")
    List<ChatRoom> findByMember(@Param("user") User user);
}
