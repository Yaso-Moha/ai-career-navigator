// realistic-generate-salary-data.js
const fs = require('fs');

const CAREERS = [
  "Software Engineer", "Data Scientist", "UI/UX Designer", "Web Developer", "Mobile Developer",
  "Systems Analyst", "Network Engineer", "Cybersecurity Specialist", "Cloud Engineer",
  "Project Manager", "Business Analyst", "Marketing Specialist", "Graphic Designer",
  "HR Specialist", "Financial Analyst", "Accountant", "Teacher", "Nurse", "Doctor",
  "Civil Engineer", "Electrician", "Chef", "Lawyer",
  "Product Manager", "Plumber", "Content Writer", "IT Support Specialist", "Mechanical Engineer",
  "Digital Marketer", "Customer Service Representative", "Sales Executive"
];

const EXPERIENCE = [
  "0 years (Fresh Graduate)", "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"
];

const EDUCATION = [
  "Diploma", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD"
];

const LOCATIONS = [
  "Malaysia", "Saudi Arabia", "United Arab Emirates", "USA", "UK", "Germany",
  "Canada", "India", "Indonesia", "Philippines", "Australia", "Singapore", "Japan", "China", "France"
];

const COST_OF_LIVING = {
  "Malaysia": 850, "Saudi Arabia": 1000, "United Arab Emirates": 1300, "USA": 1800,
  "UK": 1700, "Germany": 1600, "Canada": 1700, "India": 500, "Indonesia": 600, "Philippines": 550,
  "Australia": 1800, "Singapore": 2000, "Japan": 1700, "China": 1200, "France": 1600
};

// Utility to get base avg salary per career/location
function getBaseSalary(career, location) {
  const base = {
    "Software Engineer": 2200, "Data Scientist": 2350, "UI/UX Designer": 1750, "Web Developer": 1700,
    "Mobile Developer": 1800, "Systems Analyst": 1600, "Network Engineer": 1550, "Cybersecurity Specialist": 2100,
    "Cloud Engineer": 2450, "Project Manager": 2500, "Business Analyst": 1850, "Marketing Specialist": 1400,
    "Graphic Designer": 1250, "HR Specialist": 1400, "Financial Analyst": 1650, "Accountant": 1450,
    "Teacher": 1100, "Nurse": 1300, "Doctor": 3500, "Civil Engineer": 1550, "Electrician": 950,
    "Chef": 1000, "Lawyer": 2600, "Product Manager": 2500, "Plumber": 800, "Content Writer": 900,
    "IT Support Specialist": 1000, "Mechanical Engineer": 1500, "Digital Marketer": 1200,
    "Customer Service Representative": 950, "Sales Executive": 1200
  }[career] || 1200;

  const locMult = {
    "Malaysia": 1.0, "Saudi Arabia": 1.05, "United Arab Emirates": 1.2, "USA": 2.2, "UK": 2.0,
    "Germany": 2.0, "Canada": 1.9, "India": 0.6, "Indonesia": 0.7, "Philippines": 0.65,
    "Australia": 2.1, "Singapore": 2.2, "Japan": 2.0, "China": 1.3, "France": 2.0
  }[location] || 1.0;

  return Math.round(base * locMult);
}

function eduMultiplier(edu) {
  return {
    "Diploma": 0.88, "Associate Degree": 0.95, "Bachelor's Degree": 1.0, "Master's Degree": 1.17, "PhD": 1.27
  }[edu] || 1.0;
}

// Generate experience tiers with realistic mapping
function getSalaryTiers(base) {
  // Example: base = $2000
  // Fresh grad: 70% of base, 1-3yr: 80–95% of base, 3–5yr: ~base, 5–10yr: 115%, 10+: 130%
  return {
    "0 years (Fresh Graduate)": Math.round(base * 0.70),
    "Less than 1 year": Math.round(base * 0.80),
    "1–3 years": Math.round(base * 0.92),
    "3–5 years": Math.round(base * 1.02),
    "5–10 years": Math.round(base * 1.15),
    "10+ years": Math.round(base * 1.30),
  };
}

function makeTrend(start, years = 5, growthRate = 0.05) {
  // Small random yearly increases
  let val = start;
  let arr = [];
  for (let i = 0; i < years; ++i) {
    val = Math.round(val * (1 + growthRate + (Math.random() - 0.5) * 0.03));
    arr.push(val);
  }
  return arr;
}

function getPercentile(experience) {
  // Fresh grad always in lower group, seniors higher
  return {
    "0 years (Fresh Graduate)": 25 + Math.round(Math.random() * 10),
    "Less than 1 year": 30 + Math.round(Math.random() * 10),
    "1–3 years": 40 + Math.round(Math.random() * 10),
    "3–5 years": 55 + Math.round(Math.random() * 10),
    "5–10 years": 70 + Math.round(Math.random() * 10),
    "10+ years": 85 + Math.round(Math.random() * 8),
  }[experience] || 45;
}

let result = [];

CAREERS.forEach(career => {
  LOCATIONS.forEach(location => {
    EDUCATION.forEach(edu => {
      const baseSalary = getBaseSalary(career, location) * eduMultiplier(edu);

      // Build salary tiers per experience
      const salaryTiers = getSalaryTiers(baseSalary);

      EXPERIENCE.forEach(exp => {
        // Now set min, avg, max for *this* profile:
        let min, avg, max;
        if (exp === "0 years (Fresh Graduate)") {
          min = salaryTiers[exp];
          avg = Math.round(min * 1.04 + Math.random() * 15); // small random bump
          max = Math.round(min * 1.12 + Math.random() * 25);
        } else if (exp === "Less than 1 year") {
          min = salaryTiers["0 years (Fresh Graduate)"];
          avg = salaryTiers[exp];
          max = Math.round(avg * 1.11 + Math.random() * 28);
        } else if (exp === "1–3 years") {
          min = salaryTiers["Less than 1 year"];
          avg = salaryTiers[exp];
          max = Math.round(avg * 1.10 + Math.random() * 32);
        } else if (exp === "3–5 years") {
          min = salaryTiers["1–3 years"];
          avg = salaryTiers[exp];
          max = Math.round(avg * 1.10 + Math.random() * 40);
        } else if (exp === "5–10 years") {
          min = salaryTiers["3–5 years"];
          avg = salaryTiers[exp];
          max = Math.round(avg * 1.13 + Math.random() * 55);
        } else if (exp === "10+ years") {
          min = salaryTiers["5–10 years"];
          avg = salaryTiers[exp];
          max = salaryTiers[exp] + Math.round(salaryTiers[exp] * 0.2 + Math.random() * 80);
        }

        // Growth: based on 5–10 year delta
        const trend = makeTrend(min, 5, 0.04 + Math.random() * 0.03); // small 4–7% per year
        const growthPercent = Math.round(((trend[4] - trend[0]) / trend[0]) * 100);

        // Cost of living and after-cost salary
        const costOfLiving = COST_OF_LIVING[location];
        const afterCost = avg - costOfLiving;
        const salaryRatio = +(avg / costOfLiving).toFixed(2);

        // Save the entry
        result.push({
          career, location, experience: exp, education: edu,
          min, avg, max,
          trend, growthPercent,
          percentile: getPercentile(exp),
          costOfLiving, afterCost, salaryRatio
        });
      });
    });
  });
});

// Write to file
const out = 'export const salaryData = ' + JSON.stringify(result, null, 2) + ';';
fs.writeFileSync('salary-data-rich.js', out);

console.log(`Done! Generated ${result.length} entries to salary-data-rich.js`);
