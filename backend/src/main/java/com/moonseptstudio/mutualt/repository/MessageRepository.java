package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.ChatRoom;
import com.moonseptstudio.mutualt.model.Message;
import com.moonseptstudio.mutualt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt ASC")
    List<Message> findChatHistory(@Param("user1") User user1, @Param("user2") User user2);

    List<Message> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
    
    Message findTopByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);

    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender = :user UNION SELECT DISTINCT m.sender FROM Message m WHERE m.receiver = :user")
    List<User> findChatPartners(@Param("user") User user);

    long countByChatRoomAndIsReadFalseAndSenderNot(ChatRoom chatRoom, User sender);

    @Query("SELECT m.chatRoom.id, COUNT(m) FROM Message m WHERE m.chatRoom IN :rooms AND m.isRead = false AND m.sender <> :user GROUP BY m.chatRoom.id")
    List<Object[]> countUnreadMessagesByRooms(@Param("rooms") List<ChatRoom> rooms, @Param("user") User user);

    @Query("SELECT m FROM Message m WHERE m.id IN (SELECT MAX(m2.id) FROM Message m2 WHERE m2.chatRoom IN :rooms GROUP BY m2.chatRoom.id)")
    List<Message> findLatestMessagesByRooms(@Param("rooms") List<ChatRoom> rooms);
}
