import companies from '../data/companies.js';
import platforms from '../data/platforms.js';
import descriptions from '../data/descriptions.js';

export function createCompanyGenerator(prng) {
  const buzzwords = [
    'synergy', 'blockchain', 'AI-driven', 'machine learning', 'cloud-native', 'serverless',
    'big data', 'omnichannel', 'agile', 'scalable', 'disruptive', 'next-generation',
    'hyper-local', 'frictionless', 'ecosystem', 'paradigm shift', 'B2B', 'B2C', 'SaaS'
  ];

  const industries = [
    'FinTech', 'HealthTech', 'EdTech', 'PropTech', 'InsurTech', 'E-commerce',
    'Cybersecurity', 'Logistics', 'Retail', 'Manufacturing', 'Aerospace',
    'Biotech', 'CleanTech', 'AgriTech', 'Media', 'Entertainment', 'Automotive',
    'Telecommunications', 'Software', 'Hardware'
  ];

  const departments = [
    'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Customer Support',
    'Research and Development', 'Operations', 'Legal', 'Product Management', 'Design',
    'Quality Assurance', 'IT', 'Business Development'
  ];

  const catchphraseVerbs = ['Innovate', 'Transform', 'Deliver', 'Empower', 'Accelerate', 'Optimize', 'Elevate', 'Redefine', 'Simplify'];
  const catchphraseAdverbs = ['seamlessly', 'intelligently', 'securely', 'dynamically', 'globally', 'efficiently'];
  const catchphraseNouns = ['solutions', 'experiences', 'processes', 'growth', 'results', 'value'];

  return {
    name() {
      return prng.pick(companies);
    },
    catchPhrase() {
      if (prng.bool()) {
        return `${prng.pick(catchphraseVerbs)}. ${prng.pick(catchphraseVerbs)}. ${prng.pick(catchphraseVerbs)}.`;
      } else {
        return `${prng.pick(catchphraseVerbs)} ${prng.pick(catchphraseNouns)} ${prng.pick(catchphraseAdverbs)}.`;
      }
    },
    industry() {
      return prng.pick(industries);
    },
    platformName() {
      return prng.pick(platforms);
    },
    projectName() {
      const prefixes = ['Project', 'Operation', 'Initiative', 'Code'];
      const codenames = ['Aurora', 'Nexus', 'Zenith', 'Apollo', 'Titan', 'Phoenix', 'Genesis', 'Vanguard', 'Alpha', 'Omega'];
      return `${prng.pick(prefixes)} ${prng.pick(codenames)}`;
    },
    projectDescription() {
      return prng.pick(descriptions);
    },
    department() {
      return prng.pick(departments);
    },
    buzzword() {
      return prng.pick(buzzwords);
    }
  };
}
