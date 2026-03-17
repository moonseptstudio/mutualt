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

    public Map<Long, List<Long>> buildGraphForCategory(Long jobCategoryId) {
        Map<Long, List<Long>> adj = new HashMap<>();

        // 1. Get all relevant profiles in one go
        List<UserProfile> profiles = userProfileRepository.findByJobCategoryId(jobCategoryId);

        Map<Long, List<Long>> stationToUsers = new HashMap<>(); // stationId -> list of userIds
        List<Long> userIds = new ArrayList<>();

        for (UserProfile p : profiles) {
            if (p.getCurrentStation() != null) {
                Long uid = p.getUser().getId();
                userIds.add(uid);
                stationToUsers.computeIfAbsent(p.getCurrentStation().getId(), k -> new ArrayList<>())
                        .add(uid);
            }
        }

        if (userIds.isEmpty())
            return adj;

        // 2. Batch fetch all preferences for these users
        List<TransferPreference> allPrefs = preferenceRepository.findByUserIdIn(userIds);
        Map<Long, List<TransferPreference>> userToPrefs = new HashMap<>();
        for (TransferPreference pref : allPrefs) {
            userToPrefs.computeIfAbsent(pref.getUser().getId(), k -> new ArrayList<>()).add(pref);
        }

        // 3. Map outgoing edges: User -> List of Users at their preferred stations
        for (Long userId : userIds) {
            List<TransferPreference> prefs = userToPrefs.getOrDefault(userId, Collections.emptyList());
            // Sort by priority since findByUserIdIn doesn't guarantee order per user
            prefs.sort((a, b) -> Integer.compare(a.getPriority(), b.getPriority()));

            Set<Long> targets = new HashSet<>();
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
            adj.put(userId, new ArrayList<>(targets));
        }
        return adj;
    }

    public List<List<Long>> findCycles(Long jobCategoryId, Long startUserId) {
        Map<Long, List<Long>> adj = buildGraphForCategory(jobCategoryId);

        List<List<Long>> cycles = new ArrayList<>();
        Set<String> seenCycleHashes = new HashSet<>();

        if (startUserId != null && startUserId > 0) {
            // Find cycles for a specific user
            List<List<Long>> rawCycles = new ArrayList<>();
            dfs(startUserId, startUserId, new ArrayList<>(), rawCycles, new HashSet<>(), 1, 3, adj);

            for (List<Long> cycle : rawCycles) {
                List<Long> sortedCycle = new ArrayList<>(cycle);
                Collections.sort(sortedCycle);
                String hash = sortedCycle.toString();
                if (!seenCycleHashes.contains(hash)) {
                    cycles.add(cycle);
                    seenCycleHashes.add(hash);
                }
            }
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
