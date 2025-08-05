import { Injectable } from '@nestjs/common';
import { CreateInformationContentDto } from './dto/create-information-content.dto';
import { UpdateInformationContentDto } from './dto/update-information-content.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { InformationContent } from './schema/information-content.schema';
import { Model } from 'mongoose';
import { generateSlug } from '@/shared/utils/generate-slug.utils';
import {
  getLanguageMapValue,
  transformToLanguageMapType,
} from '@/shared/utils/utils';
import { PropertiesEnum } from '@/shared/enums/properties.enum';
@Injectable()
export class InformationContentService extends CRUDService<InformationContent> {
  constructor(
    @InjectModel(InformationContent.name)
    private readonly informationContentModel: Model<InformationContent>,
  ) {
    super(informationContentModel);
  }

  async create(createInformationContentDto: CreateInformationContentDto) {
    // Generate slug for the information
    let { language, title, subtitle, body, slug } = createInformationContentDto;
    slug ??= {
      [language]: generateSlug(getLanguageMapValue(title, language)),
    };
    const newInformationContent = await super.create({
      ...createInformationContentDto,
      slug: transformToLanguageMapType(slug),
      title: title ? transformToLanguageMapType(title) : null,
      subtitle: subtitle ? transformToLanguageMapType(subtitle) : null,
      body: body ? transformToLanguageMapType(body) : null,
    });
    return newInformationContent;
  }

  async updateInformationContent(
    _id: string,
    updateInformationContentDto: UpdateInformationContentDto,
  ) {
    try {
      //check if content exists
      await super.findOne({
        filterOptions: {
          _id: _id,
        },
      });

      const updatedFields: any = this.constructContentFieldsToUpdate(
        updateInformationContentDto,
      );

      const updatedInformationContent = await super.update(_id, updatedFields);
      return updatedInformationContent;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function is used to construct the fields to update in the database.
   * @author Damian
   * @date 10/07/2025
   * @private
   * @param {UpdateInformationContentDto} updateInformationContentDto
   * @returns {*}
   * @memberof InformationContentService
   */
  private constructContentFieldsToUpdate(
    updateInformationContentDto: UpdateInformationContentDto,
  ) {
    const updatedFields: any = {};
    const { title, subtitle, body, slug, language } =
      updateInformationContentDto;

    // Transform fields if they are present
    if (title) {
      updatedFields.title = transformToLanguageMapType(title);
      // Regenerate slug if title is updated
      updatedFields.slug = transformToLanguageMapType({
        [language]: generateSlug(getLanguageMapValue(title, language)),
      });
    } else if (slug) {
      updatedFields.slug = transformToLanguageMapType(slug);
    }

    if (subtitle) {
      updatedFields.subtitle = transformToLanguageMapType(subtitle);
    }

    if (body) {
      updatedFields.body = transformToLanguageMapType(body);
    }
    return updatedFields;
  }

  async findAllInformationContent() {
    const informationContent = await super.findAll({
      populateOptions: [
        {
          path: 'information',
          select: ['name', '_id'],
        },
      ],
    });
    return informationContent;
  }

  /**
   * @description This function finds one information content by its id.
   * @author Damian
   * @date 18/06/2025
   * @param {string} id
   * @returns {*}
   * @memberof InformationContentService
   */
  async findOneInformationContent(id: string) {
    const informationContent = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        {
          path: 'information',
          select: ['name', '_id'],
        },
      ],
    });
    return informationContent;
  }
}
