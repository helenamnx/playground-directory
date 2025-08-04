import { PlatformOption } from '../platforms.controller';

interface Query {
  filterOptions: any;
  populateOptions?: any;
  selectOptions?: any;
}

export class PlatformQuery {
  constructor(id: any, option: PlatformOption) {
    const query: Query = {
      filterOptions: { _id: id },
    };

    switch (option) {
      case 'name':
        query.selectOptions = ['_id', 'name'];
      case 'menu':
        query.selectOptions = ['_id', 'configuration', 'name'];
        query.populateOptions = [
          { path: 'configuration', select: ['_id', 'menuOptions'] },
        ];
      case 'configuration':
        query.selectOptions = ['_id', 'configuration'];
        query.populateOptions = [
          { path: 'configuration', select: ['-history'] },
        ];
      case 'all':
        query.populateOptions = [
          { path: 'configuration', select: ['-history'] },
        ];
    }

    return query;
  }
}
