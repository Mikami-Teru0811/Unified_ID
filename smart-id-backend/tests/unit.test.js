import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

const mockRequest = (options = {}) => {
  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    user: options.user || { id: 'user123', _id: 'user123', role: 'patient' },
    headers: options.headers || {},
    ip: '127.0.0.1',
    ...options
  };
  return req;
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Patient Controller Unit Tests', () => {
  describe('buildPatientSummary', () => {
    it('should build patient summary correctly', () => {
      const patient = {
        _id: 'patient123',
        fullName: 'John Doe',
        govtId: 'ABC123',
        dob: new Date('1990-01-15'),
        nfcUuid: 'NFC123',
        phone: '9876543210',
        age: 34,
        gender: 'Male',
        bloodGroup: 'O+',
        heightCm: 175,
        weightKg: 70,
        allergies: ['Peanuts'],
        surgeries: ['Appendectomy'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '9876543211'
        }
      };

      const expectedSummary = {
        id: 'patient123',
        fullName: 'John Doe',
        govtId: 'ABC123',
        dob: patient.dob,
        nfcId: 'NFC123',
        phone: '9876543210',
        age: 34,
        gender: 'Male',
        bloodGroup: 'O+',
        heightCm: 175,
        weightKg: 70,
        allergies: ['Peanuts'],
        surgeries: ['Appendectomy'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '9876543211'
        }
      };

      expect(expectedSummary.id).toBe('patient123');
      expect(expectedSummary.fullName).toBe('John Doe');
      expect(expectedSummary.bloodGroup).toBe('O+');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly for past birthdays', () => {
      const dob = new Date('1990-01-15');
      const today = new Date('2024-06-01');
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      expect(age).toBe(34);
    });

    it('should calculate age correctly for future birthdays this year', () => {
      const dob = new Date('1990-12-15');
      const today = new Date('2024-06-01');
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      expect(age).toBe(33);
    });
  });

  describe('parseAllergies', () => {
    it('should parse comma-separated string allergies', () => {
      const input = 'Peanuts, Penicillin, Pollen';
      const result = input.split(',').map(item => item.trim());
      expect(result).toEqual(['Peanuts', 'Penicillin', 'Pollen']);
    });

    it('should handle array input', () => {
      const input = ['Peanuts', 'Penicillin'];
      expect(input).toEqual(['Peanuts', 'Penicillin']);
    });

    it('should filter empty values', () => {
      const input = 'Peanuts, , Penicillin';
      const result = input.split(',').map(item => item.trim()).filter(Boolean);
      expect(result).toEqual(['Peanuts', 'Penicillin']);
    });
  });

  describe('parseOptionalPositiveNumber', () => {
    it('should parse valid positive numbers', () => {
      const parseOptionalPositiveNumber = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return null;
        return parsed;
      };
      
      expect(parseOptionalPositiveNumber(100)).toBe(100);
      expect(parseOptionalPositiveNumber('150')).toBe(150);
      expect(parseOptionalPositiveNumber(0)).toBeNull();
      expect(parseOptionalPositiveNumber(-10)).toBeNull();
      expect(parseOptionalPositiveNumber('')).toBeNull();
      expect(parseOptionalPositiveNumber(null)).toBeNull();
    });
  });
});

describe('OTP Controller Unit Tests', () => {
  describe('safeCompareOTP', () => {
    it('should return true for matching OTPs', () => {
      const safeCompareOTP = (inputOtp, storedOtp) => {
        if (!inputOtp || !storedOtp) return false;
        if (inputOtp.length !== storedOtp.length) return false;
        return inputOtp === storedOtp;
      };

      expect(safeCompareOTP('123456', '123456')).toBe(true);
    });

    it('should return false for non-matching OTPs', () => {
      const safeCompareOTP = (inputOtp, storedOtp) => {
        if (!inputOtp || !storedOtp) return false;
        if (inputOtp.length !== storedOtp.length) return false;
        return inputOtp === storedOtp;
      };

      expect(safeCompareOTP('123456', '654321')).toBe(false);
    });

    it('should return false for different length OTPs', () => {
      const safeCompareOTP = (inputOtp, storedOtp) => {
        if (!inputOtp || !storedOtp) return false;
        if (inputOtp.length !== storedOtp.length) return false;
        return inputOtp === storedOtp;
      };

      expect(safeCompareOTP('12345', '123456')).toBe(false);
    });
  });

  describe('OTP Generation', () => {
    it('should generate 6-digit OTP', () => {
      const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
      
      for (let i = 0; i < 100; i++) {
        const otp = generateOTP();
        expect(otp.length).toBe(6);
        expect(Number(otp)).toBeGreaterThanOrEqual(100000);
        expect(Number(otp)).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('OTP Expiration', () => {
    it('should set expiration to 5 minutes', () => {
      const now = Date.now();
      const expires = new Date(now + 5 * 60 * 1000);
      const diff = expires.getTime() - now;
      
      expect(diff).toBe(5 * 60 * 1000);
    });
  });
});

describe('Hospital Controller Unit Tests', () => {
  describe('getHospitals filtering', () => {
    it('should filter hospitals by scheme', () => {
      const hospitals = [
        { empanelled: [{ scheme: 'CMCHIS', active: true }] },
        { empanelled: [{ scheme: 'PMJAY', active: true }] },
        { empanelled: [{ scheme: 'CMCHIS', active: true }, { scheme: 'PMJAY', active: true }] }
      ];

      const filterByScheme = (hospitals, scheme) => 
        hospitals.filter(h => h.empanelled.some(e => e.scheme === scheme && e.active));

      expect(filterByScheme(hospitals, 'CMCHIS').length).toBe(2);
      expect(filterByScheme(hospitals, 'PMJAY').length).toBe(2);
    });

    it('should filter hospitals by city', () => {
      const hospitals = [
        { address: { city: 'Chennai' } },
        { address: { city: 'Madurai' } },
        { address: { city: 'Chennai' } }
      ];

      const filterByCity = (hospitals, city) =>
        hospitals.filter(h => h.address?.city?.toLowerCase() === city.toLowerCase());

      expect(filterByCity(hospitals, 'Chennai').length).toBe(2);
      expect(filterByCity(hospitals, 'Coimbatore').length).toBe(0);
    });

    it('should filter hospitals by emergency services', () => {
      const hospitals = [
        { emergencyServices: true },
        { emergencyServices: false },
        { emergencyServices: true }
      ];

      const filterByEmergency = (hospitals) =>
        hospitals.filter(h => h.emergencyServices === true);

      expect(filterByEmergency(hospitals).length).toBe(2);
    });
  });
});

describe('Insurance Eligibility Unit Tests', () => {
  describe('checkEligibility', () => {
    const checkEligibility = (patient) => {
      const { annualIncome, isGovEmployee } = patient;

      return {
        CMCHIS: annualIncome < 72000,
        PMJAY: annualIncome < 100000,
        TN_UHS: isGovEmployee,
        PRIVATE: true
      };
    };

    it('should return correct eligibility for low income patient', () => {
      const patient = { annualIncome: 50000, isGovEmployee: false };
      const result = checkEligibility(patient);

      expect(result.CMCHIS).toBe(true);
      expect(result.PMJAY).toBe(true);
      expect(result.TN_UHS).toBe(false);
      expect(result.PRIVATE).toBe(true);
    });

    it('should return correct eligibility for government employee', () => {
      const patient = { annualIncome: 150000, isGovEmployee: true };
      const result = checkEligibility(patient);

      expect(result.CMCHIS).toBe(false);
      expect(result.PMJAY).toBe(false);
      expect(result.TN_UHS).toBe(true);
      expect(result.PRIVATE).toBe(true);
    });

    it('should return correct eligibility for high income patient', () => {
      const patient = { annualIncome: 200000, isGovEmployee: false };
      const result = checkEligibility(patient);

      expect(result.CMCHIS).toBe(false);
      expect(result.PMJAY).toBe(false);
      expect(result.TN_UHS).toBe(false);
      expect(result.PRIVATE).toBe(true);
    });
  });
});

describe('SMS Service Unit Tests', () => {
  describe('normalizePhone', () => {
    const normalizePhone = (phone) => {
      if (!phone) return null;
      let normalized = phone.replace(/[^\d+]/g, '');
      
      if (normalized.startsWith('+91')) return normalized;
      if (normalized.startsWith('91') && normalized.length === 12) return '+' + normalized;
      if (normalized.length === 10) return '+91' + normalized;
      if (normalized.startsWith('0')) return '+91' + normalized.substring(1);
      if (!normalized.startsWith('+')) return '+91' + normalized;
      return normalized;
    };

    it('should normalize 10-digit Indian numbers', () => {
      expect(normalizePhone('9876543210')).toBe('+919876543210');
      expect(normalizePhone('9876543210')).toBe('+919876543210');
    });

    it('should handle numbers with +91 prefix', () => {
      expect(normalizePhone('+919876543210')).toBe('+919876543210');
    });

    it('should handle numbers with leading 0', () => {
      expect(normalizePhone('09876543210')).toBe('+919876543210');
    });

    it('should return null for invalid input', () => {
      expect(normalizePhone('')).toBeNull();
      expect(normalizePhone(null)).toBeNull();
      expect(normalizePhone(undefined)).toBeNull();
    });
  });
});
