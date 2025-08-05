export function findOneByIdPopulates() {
  return {
    selectOptions: ['-history', '-appUser'],
    populateOptions: [
      {
        path: 'statusHistory',
        populate: 'status',
      },
      {
        path: 'questions',
        select: ['-history'],
        populate: [
          'answers',
          {
            path: 'question',
            populate: [
              {
                path: 'topics',
                select: ['title'],
              },
              {
                path: 'information',
                select: ['-history', '-alias'],
                populate: [
                  {
                    path: 'content',
                    select: ['title'],
                  },
                ],
              },
              {
                path: 'answerOptions',
                select: ['value'],
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
            ],
            select: ['-history'],
          },
        ],
      },
      {
        path: 'exam',
        select: ['-history', '-questions'],
        populate: [
          'configuration',
          {
            path: 'topics',
            select: ['title'],
          },
          {
            path: 'information',
            populate: [
              {
                path: 'content',
                select: ['title'],
              },
            ],
          },
        ],
      },
    ],
  };
}
