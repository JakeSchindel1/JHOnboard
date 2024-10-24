const fs = require('fs');
const path = require('path');

const filesToCreate = [
  'app/onboarding/page.tsx',
  'app/onboarding/OnboardingPage1.tsx',
  'app/onboarding/OnboardingPage2.tsx',
  'app/onboarding/OnboardingPage3.tsx',
  'app/onboarding/OnboardingPage4.tsx',
  'components/ui/button.tsx',
  'components/ui/input.tsx',
  'components/ui/label.tsx',
  'components/ui/radio-group.tsx',
  'components/ui/select.tsx',
  'lib/utils.ts',
  'types/onboarding.ts'
];

filesToCreate.forEach(file => {
  const filePath = path.join(__dirname, file);
  const dirName = path.dirname(filePath);
  
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created file: ${file}`);
  } else {
    console.log(`File already exists: ${file}`);
  }
});

console.log('File creation complete!');
