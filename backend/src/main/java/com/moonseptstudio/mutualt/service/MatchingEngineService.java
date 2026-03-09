package com.moonseptstudio.mutualt.service;

import com.moonseptstudio.mutualt.model.TransferPreference;
import com.moonseptstudio.mutualt.model.UserProfile;
import com.moonseptstudio.mutualt.repository.TransferPreferenceRepository;
import com.moonseptstudio.mutualt.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MatchingEngineService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private TransferPreferenceRepository preferenceRepository;

    public Map<Long, List<Long>> buildGraphForCategory(Long jobCategoryId, Long gradeId) {
        Map<Long, List<Long>> adj = new HashMap<>();

        // 1. Get all profiles in this criteria
        List<UserProfile> profiles = userProfileRepository.findAll();
        // Note: In production, use a custom query: findByJobCategoryIdAndGradeId

        Map<Long, List<Long>> stationToUsers = new HashMap<>(); // stationId -> list of userIds
        for (UserProfile p : profiles) {
            if (p.getJobCategory() != null && p.getGrade() != null && p.getCurrentStation() != null &&
                    p.getJobCategory().getId().equals(jobCategoryId) &&
                    p.getGrade().getId().equals(gradeId)) {
                stationToUsers.computeIfAbsent(p.getCurrentStation().getId(), k -> new ArrayList<>())
                        .add(p.getUser().getId());
            }
        }

        // 2. Map outgoing edges: User -> List of Users at their preferred stations
        for (UserProfile p : profiles) {
            if (p.getJobCategory() != null && p.getGrade() != null &&
                    p.getJobCategory().getId().equals(jobCategoryId) &&
                    p.getGrade().getId().equals(gradeId)) {

                Long userId = p.getUser().getId();
                List<TransferPreference> prefs = preferenceRepository.findByUserIdOrderByPriorityAsc(userId);

                List<Long> targets = new ArrayList<>();
                for (TransferPreference pref : prefs) {
                    if (pref.getPreferredStation() != null) {
                        List<Long> targetUserIds = stationToUsers.get(pref.getPreferredStation().getId());
                        if (targetUserIds != null) {
                            for (Long targetUserId : targetUserIds) {
                                if (!targetUserId.equals(userId)) {
                                    targets.add(targetUserId);
                                }
                            }
                        }
                    }
                }
                adj.put(userId, targets);
            }
        }
        return adj;
    }

    public List<List<Long>> findCycles(Long jobCategoryId, Long gradeId, Long startUserId) {
        Map<Long, List<Long>> adj = buildGraphForCategory(jobCategoryId, gradeId);

        List<List<Long>> cycles = new ArrayList<>();
        Set<String> seenCycleHashes = new HashSet<>();

        if (startUserId != null && startUserId > 0) {
            // Find cycles for a specific user
            dfs(startUserId, startUserId, new ArrayList<>(), cycles, new HashSet<>(), 1, 3, adj);
        } else {
            // Find all cycles for this category (for admin)
            for (Long userId : adj.keySet()) {
                List<List<Long>> userCycles = new ArrayList<>();
                dfs(userId, userId, new ArrayList<>(), userCycles, new HashSet<>(), 1, 3, adj);

                for (List<Long> cycle : userCycles) {
                    List<Long> sortedCycle = new ArrayList<>(cycle);
                    Collections.sort(sortedCycle);
                    String hash = sortedCycle.toString();
                    if (!seenCycleHashes.contains(hash)) {
                        cycles.add(cycle);
                        seenCycleHashes.add(hash);
                    }
                }
            }
        }

        return cycles;
    }

    private void dfs(Long startId, Long currentId, List<Long> path, List<List<Long>> cycles, Set<Long> visited,
            int depth, int maxDepth, Map<Long, List<Long>> adj) {
        if (depth > maxDepth)
            return;

        path.add(currentId);
        visited.add(currentId);

        List<Long> neighbors = adj.getOrDefault(currentId, new ArrayList<>());
        for (Long neighbor : neighbors) {
            if (neighbor.equals(startId) && depth >= 2) {
                cycles.add(new ArrayList<>(path));
            } else if (!visited.contains(neighbor)) {
                dfs(startId, neighbor, path, cycles, visited, depth + 1, maxDepth, adj);
            }
        }

        path.remove(path.size() - 1);
        visited.remove(currentId);
    }
}
