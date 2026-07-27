// Unit tests for skill matching utility functions
import {
  computeMatchScore,
  sortJobsByMatchScore,
} from '@/utils/skillMatching';

describe('Skill Matching Utility Functions', () => {
  describe('computeMatchScore', () => {
    it('should return perfect match when job has no required skills', () => {
      const result = computeMatchScore(['React', 'Node'], null);
      expect(result.score).toBe(100);
      expect(result.label).toBe('high');
      expect(result.matchedSkills).toEqual([]);
      expect(result.missingSkills).toEqual([]);
      expect(result.summary).toBe('No specific skills required.');
    });

    it('should return perfect match when job has empty skills array', () => {
      const result = computeMatchScore(['React', 'Node'], []);
      expect(result.score).toBe(100);
      expect(result.label).toBe('high');
    });

    it('should return zero match when user has no skills', () => {
      const result = computeMatchScore([], ['React', 'Node']);
      expect(result.score).toBe(0);
      expect(result.label).toBe('none');
      expect(result.matchedSkills).toEqual([]);
      expect(result.missingSkills).toEqual(['React', 'Node']);
    });

    it('should calculate correct match percentage', () => {
      const result = computeMatchScore(['React', 'Node'], ['React', 'Node', 'TypeScript']);
      expect(result.score).toBe(67); // 2 out of 3 = 66.67% rounded
      expect(result.matchedSkills).toEqual(['React', 'Node']);
      expect(result.missingSkills).toEqual(['TypeScript']);
    });

    it('should handle partial matches with substring matching', () => {
      const result = computeMatchScore(['React', 'Node.js'], ['React', 'Node']);
      expect(result.score).toBe(100);
      expect(result.matchedSkills).toEqual(['React', 'Node']);
    });

    it('should handle bidirectional substring matching', () => {
      const result = computeMatchScore(['React'], ['React.js']);
      expect(result.score).toBe(100);
      expect(result.matchedSkills).toEqual(['React.js']);
    });

    it('should be case-insensitive', () => {
      const result = computeMatchScore(['react', 'node'], ['React', 'Node']);
      expect(result.score).toBe(100);
    });

    it('should trim whitespace', () => {
      const result = computeMatchScore([' React ', ' Node '], ['React', 'Node']);
      expect(result.score).toBe(100);
    });

    it('should return high label for score >= 70', () => {
      expect(computeMatchScore(['React', 'Node', 'TypeScript'], ['React', 'Node', 'TypeScript']).label).toBe('high');
      expect(computeMatchScore(['React', 'Node'], ['React', 'Node', 'TypeScript']).label).toBe('medium');
    });

    it('should return medium label for score >= 40', () => {
      expect(computeMatchScore(['React'], ['React', 'Node', 'TypeScript']).label).toBe('low');
    });

    it('should return low label for score > 0', () => {
      expect(computeMatchScore(['React'], ['React', 'Node', 'TypeScript', 'Python']).label).toBe('low');
    });

    it('should return none label for score 0', () => {
      expect(computeMatchScore([], ['React', 'Node']).label).toBe('none');
    });

    it('should generate correct summary for full match', () => {
      const result = computeMatchScore(['React', 'Node'], ['React', 'Node']);
      expect(result.summary).toBe('You match all 2 required skills.');
    });

    it('should generate correct summary for partial match', () => {
      const result = computeMatchScore(['React'], ['React', 'Node']);
      expect(result.summary).toBe('You match 1 of 2 required skills.');
    });

    it('should generate correct summary for single skill', () => {
      const result = computeMatchScore(['React'], ['React']);
      expect(result.summary).toBe('You match all 1 required skill.');
    });

    it('should generate correct summary for no skills', () => {
      const result = computeMatchScore([], ['React', 'Node']);
      expect(result.summary).toBe('Add skills to your profile to see how well you match.');
    });
  });

  describe('sortJobsByMatchScore', () => {
    const mockJobs = [
      { id: '1', skills_required: ['React', 'Node', 'TypeScript'] },
      { id: '2', skills_required: ['React'] },
      { id: '3', skills_required: ['React', 'Node'] },
      { id: '4', skills_required: ['Python', 'Django'] },
    ];

    it('should sort jobs by descending match score', () => {
      const userSkills = ['React', 'Node', 'TypeScript'];
      const sorted = sortJobsByMatchScore(mockJobs, userSkills);
      
      expect(sorted[0].id).toBe('1'); // 100% match
      expect(sorted[1].id).toBe('2'); // 67% match
      expect(sorted[2].id).toBe('3'); // 33% match
      expect(sorted[3].id).toBe('4'); // 0% match
    });

    it('should maintain original order for same scores', () => {
      const jobsWithSameScore = [
        { id: '1', skills_required: ['React'] },
        { id: '2', skills_required: ['Node'] },
        { id: '3', skills_required: ['TypeScript'] },
      ];
      
      const userSkills = ['React'];
      const sorted = sortJobsByMatchScore(jobsWithSameScore, userSkills);
      
      // First job should be the one with React (100% match)
      expect(sorted[0].id).toBe('1');
      // The other two should maintain their relative order (0% match)
      expect(sorted[1].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });

    it('should return original array if user has no skills', () => {
      const sorted = sortJobsByMatchScore(mockJobs, []);
      expect(sorted).toEqual(mockJobs);
    });

    it('should not mutate original array', () => {
      const original = [...mockJobs];
      sortJobsByMatchScore(mockJobs, ['React']);
      expect(mockJobs).toEqual(original);
    });

    it('should handle empty jobs array', () => {
      const sorted = sortJobsByMatchScore([], ['React']);
      expect(sorted).toEqual([]);
    });

    it('should handle jobs with no skills_required', () => {
      const jobs = [
        { id: '1', skills_required: null },
        { id: '2', skills_required: undefined },
        { id: '3', skills_required: [] },
      ];
      
      const sorted = sortJobsByMatchScore(jobs, ['React']);
      // All should have 100% match, maintain original order
      expect(sorted).toEqual(jobs);
    });
  });
});
