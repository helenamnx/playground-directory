/**
 * @description This function returns the populates for the createExamAttempt function.
 * @author Damian
 * @date 04/07/2025
 * @export
 * @returns {*}
 */
export function createExamAttemptPopulates() {
  return {
    populateOptions: [
      {
        path: 'statusHistory',
        populate: 'status',
      },
      {
        path: 'questions',

        select: ['-history', '-createdAt', '-updatedAt', '__v'],
        populate: [
          {
            path: 'question',
            populate: [
              {
                path: 'information',
                populate: ['content'],
              },
              {
                path: 'answers',
                select: [
                  'value',
                  '-history',
                  '-createdAt',
                  '-updatedAt',
                  '__v',
                ],
              },
            ],
            select: [
              '-configuration',
              '-topics',
              '-observations',
              '-difficulty',
            ],
          },
        ],
      },
      {
        path: 'exam',
        select: ['configuration', '-questions'],
        populate: [
          {
            path: 'configuration',
            select: ['showAnswers', 'timed', 'isTimerEnabled'],
          },
        ],
      },
    ],
    selectOptions: ['-history', '-score', '-appUser'],
  };
}
