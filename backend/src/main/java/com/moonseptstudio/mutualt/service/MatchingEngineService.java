package com.moonseptstudio.mutualt.service;

import com.moonseptstudio.mutualt.model.*;
import com.moonseptstudio.mutualt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MatchingEngineService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private TransferPreferenceRepository preferenceRepository;

    private Map<Long, List<Long>> adj = new HashMap<>();

    public void buildGraphForCategory(Long jobCategoryId, Long gradeId) {
        adj.clear();

        // 1. Get all profiles in this criteria
        List<UserProfile> profiles = userProfileRepository.findAll();
        // Note: In production, use a custom query: findByJobCategoryIdAndGradeId

        Map<Long, Long> stationToUser = new HashMap<>(); // stationId -> userId
        for (UserProfile p : profiles) {
            if (p.getJobCategory().getId().equals(jobCategoryId) &&
                    p.getGrade().getId().equals(gradeId)) {
                stationToUser.put(p.getCurrentStation().getId(), p.getUser().getId());
            }
        }

        // 2. Map outgoing edges: User -> List of Users at their preferred stations
        for (UserProfile p : profiles) {
            if (p.getJobCategory().getId().equals(jobCategoryId) &&
                    p.getGrade().getId().equals(gradeId)) {

                Long userId = p.getUser().getId();
                List<TransferPreference> prefs = preferenceRepository.findByUserIdOrderByPriorityAsc(userId);

                List<Long> targets = new ArrayList<>();
                for (TransferPreference pref : prefs) {
                    Long targetUserId = stationToUser.get(pref.getPreferredStation().getId());
                    if (targetUserId != null && !targetUserId.equals(userId)) {
                        targets.add(targetUserId);
                    }
                }
                adj.put(userId, targets);
            }
        }
    }

    public List<List<Long>> findCycles(Long jobCategoryId, Long gradeId, Long startUserId) {
        buildGraphForCategory(jobCategoryId, gradeId);

        List<List<Long>> cycles = new ArrayList<>();
        Set<String> seenCycleHashes = new HashSet<>();

        if (startUserId != null && startUserId > 0) {
            // Find cycles for a specific user
            dfs(startUserId, startUserId, new ArrayList<>(), cycles, new HashSet<>(), 1, 3);
        } else {
            // Find all cycles for this category (for admin)
            for (Long userId : adj.keySet()) {
                List<List<Long>> userCycles = new ArrayList<>();
                dfs(userId, userId, new ArrayList<>(), userCycles, new HashSet<>(), 1, 3);

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
            int depth, int maxDepth) {
        if (depth > maxDepth)
            return;

        path.add(currentId);
        visited.add(currentId);

        List<Long> neighbors = adj.getOrDefault(currentId, new ArrayList<>());
        for (Long neighbor : neighbors) {
            if (neighbor.equals(startId) && depth >= 2) {
                cycles.add(new ArrayList<>(path));
            } else if (!visited.contains(neighbor)) {
                dfs(startId, neighbor, path, cycles, visited, depth + 1, maxDepth);
            }
        }

        path.remove(path.size() - 1);
        visited.remove(currentId);
    }
}
