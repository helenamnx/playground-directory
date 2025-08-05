export const getExamQuestionsPopulate = [
  {
    path: 'topics',
    select: ['-code', '-history', '-parentCategories', '-scopes'],
  },
  {
    path: 'information',
    select: ['-history'],
    populate: ['content'],
  },
  {
    path: 'answerOptions',
    select: ['-isCorrect', '-history', '-justification'],
  },
  {
    path: 'configuration',
    select: [
      '-history',
      '-servicesEntrypoints',
      '-weight',
      '-negativeMarking',
      '-partialMarking',
      '-roles',
    ],
  },
];
