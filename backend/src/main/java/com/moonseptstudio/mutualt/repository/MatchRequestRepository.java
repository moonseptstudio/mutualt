package com.moonseptstudio.mutualt.repository;

import com.moonseptstudio.mutualt.model.MatchRequest;
import com.moonseptstudio.mutualt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatchRequestRepository extends JpaRepository<MatchRequest, Long> {
    List<MatchRequest> findByReceiver(User receiver);

    List<MatchRequest> findBySender(User sender);

    boolean existsBySenderAndReceiverAndStatus(User sender, User receiver, String status);

    List<MatchRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    List<MatchRequest> findBySenderIdAndReceiverIdIn(Long senderId, List<Long> receiverIds);

    List<MatchRequest> findByReceiverIdAndSenderIdIn(Long receiverId, List<Long> senderIds);
}
