import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInformationDto } from './dto/create-information.dto';
import { Information } from './schema/information.schema';
import { Model } from 'mongoose';
import { InformationContentService } from '../information-content/information-content.service';
import { UpdateInformationDto } from './dto/update-information.dto';
import { HistoryService } from '../history/history.service';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { NotFoundCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { InformationContent } from '../information-content/schema/information-content.schema';
import { CreateInformationContentDto } from '../information-content/dto/create-information-content.dto';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { LanguageMapType } from '@/shared/types/language-map.type';

@Injectable()
export class InformationService extends CRUDService<Information> {
  constructor(
    @InjectModel(Information.name)
    private readonly informationModel: Model<Information>,
    private readonly informationContentService: InformationContentService,
    private readonly historyService: HistoryService,
  ) {
    super(informationModel);
  }

  async createInformation(createInformationDto: CreateInformationDto) {
    try {
      const newInformationContent = await this.informationContentService.create(
        createInformationDto.content,
      );
      const createdSlug = newInformationContent.slug as LanguageMapType;
      const newInformation = await super.create({
        ...createInformationDto,
        content: newInformationContent._id,
        alias:
          createInformationDto.alias ||
          createdSlug.languageMap[LanguagesEnum.ES], //TODO: recoger default
      });
      //TODO: add history

      return newInformation;
    } catch (error) {
      //TODO: add history

      throw error;
    }
  }

  async findAllInformations(lang?: string) {
    const informations = await super.findAll({
      populateOptions: [
        {
          path: 'content',
          select: ['title', 'subtitle', 'body', 'slug'],
        },
      ],
    });
    if (lang) {
      return informations.map((item) => filterLanguageMap(item.toJSON(), lang));
    }
    return informations;
  }

  async findOneInformation(id: string, lang?: string) {
    const information = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        {
          path: 'content',
          select: ['title', 'subtitle', 'body', 'slug'],
        },
      ],
    });

    // If a language is provided, filter the news items
    if (lang) {
      return filterLanguageMap(information.toJSON(), lang);
    }
    return information;
  }
  async findInformationByContentTitle({ title }: { title: string }) {
    const information = await super.findOne({
      filterOptions: {
        'content.title': title,
      },
      triggerError: false,
    });

    return information;
  }

  /**
   * @description This function finds an information by its title.
   * @author Damian
   * @date 10/07/2025
   * @param {string} title
   * @param {string} lang
   * @returns {*}  {Promise<Information>}
   * @memberof InformationService
   */
  async findInformationByTitle(
    title: string,
    lang: string,
    triggerError = true,
  ): Promise<Information> {
    try {
      const storedContent = await this.informationContentService.findOne({
        filterOptions: {
          ['title.languageMap.' + lang]: title,
        },
        triggerError: triggerError,
      });
      if (!storedContent && !triggerError) return null;
      const storedInformation = await this.findOne({
        filterOptions: {
          content: storedContent,
        },
      });
      return storedInformation;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async updateInformation(
    updateInformationDto: UpdateInformationDto,
    language: string,
  ) {
    //find the information  populated with content
    const information = await super.findOne({
      filterOptions: {
        _id: updateInformationDto._id,
      },
      populateOptions: ['content'],
    });

    if (!information) {
      throw new NotFoundCustomResponse({
        title: 'Information not found',
        key: CustomErrorKeys.INFORMATION_NOT_FOUND,
        detail: `Information with ID "${updateInformationDto._id}" does not exist.`,
      });
    }
    //find the content
    const content = await this.informationContentService.findOne({
      filterOptions: {
        _id: information.content._id,
      },
    });
    //Update the content
    const updatedContent =
      await this.informationContentService.updateInformationContent(
        content._id,
        { ...updateInformationDto.content, language: language },
      );
    //Update the information
    const updatedInformation = await super.update(updateInformationDto._id, {
      ...updateInformationDto,
      content: updatedContent,
    });
    return updatedInformation;
  }

  /**
   * @description This function finds all information by their title.
   * It uses regex to find the title in the information content.
   * @author Damian
   * @date 18/06/2025
   * @param {string} title
   * @memberof InformationService
   */
  async findAllInformationByTitle(title: string) {
    const storedInformationContent =
      await this.informationContentService.findAll({
        filterOptions: {
          'title.languageMap.es': {
            //TODO: quitar string a pelo
            $regex: title,
          },
        },
      });
    const storedInformation = await this.findAll({
      filterOptions: {
        content: storedInformationContent,
      },
      populateOptions: [
        {
          path: 'content',
          select: ['title', 'subtitle', 'body', 'slug'],
        },
      ],
    });
    return storedInformation;
  }
}
