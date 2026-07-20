import mockdrop from './dist/mockdrop.esm.js';

const myDummyData = mockdrop.create({
  leadName: () => mockdrop.projectName(),
  leadDescription: () => mockdrop.projectDescription(),
  leadAmount: () => mockdrop.amount(1000, 50000),
  leadCreatedAt: () => mockdrop.past(),
  leadCreatedBy: () => mockdrop.fullName(),
  leadSource: () => mockdrop.platformName(),
  leadEmail: () => mockdrop.email({ domain: 'mailinator.com' })
}, 2);

console.log(JSON.stringify(myDummyData, null, 2));
