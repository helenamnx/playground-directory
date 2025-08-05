import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import {
  BadRequestCustomResponse,
  ConflictCustomResponse,
  NotFoundCustomResponse,
} from '@/shared/responses/error/custom-error-response';
import { InjectModel } from '@nestjs/mongoose';
import { ClientConfigurationsService } from '../client-configurations/client-configurations.service';
import { Client } from './schemas/client.schema';
import { Model } from 'mongoose';
import { InformationService } from '../information/information.service';
import { Information } from '../information/schema/information.schema';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
import { CreateInformationDto } from '../information/dto/create-information.dto';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { UpdateInformationDto } from '../information/dto/update-information.dto';
import { ContactPointsService } from '../contact-points/contact-points.service';
import { SendContactEmailDto } from '../messages/dto/send-contact-email.dto';

@Injectable()
export class ClientsService extends CRUDService<Client> {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<Client>,
    private readonly clientConfigurationsService: ClientConfigurationsService,
    private readonly informationService: InformationService,
    private readonly contactPointsService: ContactPointsService,
  ) {
    super(clientModel);
  }

  async createClient(createClientDto: CreateClientDto) {
    try {
      //check if the client already exists
      const client = await this.findOne({
        filterOptions: {
          alias: createClientDto.alias,
        },
        triggerError: false,
      });
      if (client) {
        throw new ConflictCustomResponse({
          title: 'The client already exists',
          detail: 'The client with the same externalId already exists',
          key: CustomErrorKeys.CLIENT_ALREADY_EXISTS,
        });
      }

      //create the information if provided
      let informationIds: Information['_id'][] = [];
      if (createClientDto.information) {
        informationIds = await Promise.all(
          createClientDto.information.map(async (information) => {
            const storedInformation =
              await this.informationService.createInformation(information);
            return storedInformation._id;
          }),
        );
      }
      let contactPointsIds: string[] = [];
      //create the contact points if provided
      if (createClientDto.contactPoints) {
        contactPointsIds = await Promise.all(
          createClientDto.contactPoints.map(async (contactPoint) => {
            const storedContactPoint =
              await this.contactPointsService.createContactPoint(contactPoint);
            return storedContactPoint._id;
          }),
        );
      }

      //create the client configuration
      const newClientConfiguration =
        await this.clientConfigurationsService.createClientConfiguration(
          createClientDto.configuration,
        );
      //create the client
      const newClient = await super.create({
        ...createClientDto,
        configuration: newClientConfiguration._id,
        information: informationIds,
        contactPoints: contactPointsIds,
      });
      //TODO: add history
      return newClient;
    } catch (error) {
      //TODO: add history

      throw error;
    }
  }

  findAllClients() {
    return `This action returns all clients`;
  }

  findOneClient(id: number) {
    return `This action returns a #${id} client`;
  }

  async updateClient(updateClientDto: UpdateClientDto) {
    try {
      const storedClient = await super.findOne({
        filterOptions: {
          _id: updateClientDto._id,
        },
        populateOptions: ['configuration'],
      });

      const updatedClientConfiguration =
        await this.clientConfigurationsService.updateClientConfiguration({
          _id: storedClient.configuration._id,
          ...updateClientDto.configuration,
        });
      const updatedClient = await super.update(updateClientDto._id, {
        ...updateClientDto,
        configuration: updatedClientConfiguration._id,
      });

      return updatedClient;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  removeClient(id: number) {
    return `This action removes a #${id} client`;
  }

  async getClientDefaultLanguage(clientId: string) {
    const storedClient = await this.findOne({
      filterOptions: {
        _id: clientId,
      },
      populateOptions: ['configuration'],
    });
    return storedClient.configuration.defaultLanguage;
  }

  /**
   * @description This function returns the information of a client
   * @author Damian
   * @date 10/07/2025
   * @param {string} clientId
   * @param {string} informationAlias
   * @param {string} [lang]
   * @returns {*}
   * @memberof ClientsService
   */
  async getClientInformation(params: {
    clientId: string;
    informationAlias?: string;
    lang?: string;
  }) {
    try {
      const { clientId, informationAlias, lang } = params;
      //first, check if the client exists
      const storedClient = await this.findOne({
        filterOptions: {
          _id: clientId,
        },

        populateOptions: [
          {
            path: 'information',
            select: ['-history'],
            populate: { path: 'content', select: ['-history'] },
          },
        ],
      });
      let clientInformation: Information[] | Information =
        storedClient.information;

      //if alias is provided, find the information
      if (informationAlias) {
        const storedInformation = storedClient.information.find(
          (information) => information.alias === informationAlias,
        );
        if (!storedInformation) {
          throw new NotFoundCustomResponse({
            title: 'Information not found',
            key: CustomErrorKeys.INFORMATION_NOT_FOUND,
            detail: `Information with alias ${informationAlias} not found`,
          });
        }
        clientInformation = storedInformation;
      }

      if (lang) {
        //if clientInformation is array, map it to the language
        if (clientInformation instanceof Array) {
          return clientInformation.map((information) =>
            filterLanguageMap(information.toObject(), lang),
          );
        }
        return filterLanguageMap(clientInformation.toObject(), lang);
      }
      return clientInformation;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async createClientInformation(
    clientId: string,
    language: string,
    createInformationDto: CreateInformationDto,
  ): Promise<Information> {
    try {
      //check if the client exists
      const storedClient = await super.findOne({
        filterOptions: {
          _id: clientId,
        },
        populateOptions: ['information'],
      });

      //check if the information already exists
      const storedInformation =
        await this.informationService.findInformationByTitle(
          createInformationDto.content.title[language],
          language,
          false,
        );

      //if the information already exists, check if belongs to the client

      if (storedInformation) {
        const alreadyExistsOnClient = storedClient.information.some(
          (information) => information._id === storedInformation._id,
        );
        if (alreadyExistsOnClient) {
          throw new ConflictCustomResponse({
            title: 'Information already exists',
            key: CustomErrorKeys.INFORMATION_ALREADY_EXISTS,
            detail: `Information with title "${createInformationDto.content.title[language]}" already exists`,
          });
        }
      }

      //create the new information
      const newInformation =
        await this.informationService.createInformation(createInformationDto);

      //push the information to the client
      await super.update(clientId, {
        $push: {
          information: newInformation._id,
        },
      });
      return newInformation;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async updateClientInformation(
    clientId: string,
    language: string,
    updateInformationDto: UpdateInformationDto,
  ): Promise<Information> {
    try {
      //check if the client exists
      const storedClient = await super.findOne({
        filterOptions: {
          _id: clientId,
        },
        populateOptions: ['information'],
      });

      //check if the information already exists
      const storedInformation =
        await this.informationService.findInformationByTitle(
          updateInformationDto.content.title[language],
          language,
          false,
        );

      //if the information already exists, check if belongs to the client
      if (storedInformation) {
        const alreadyExistsOnClient = storedClient.information.some(
          (information) => information._id === storedInformation._id,
        );
        if (!alreadyExistsOnClient) {
          throw new ConflictCustomResponse({
            title: 'Information already exists',
            key: CustomErrorKeys.INFORMATION_ALREADY_EXISTS,
            detail: `Information with title "${updateInformationDto.content.title[language]}" already exists`,
          });
        }
      }

      //update the information
      const updatedInformation =
        await this.informationService.updateInformation(
          updateInformationDto,
          language,
        );

      return updatedInformation;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function returns the contact points of a client
   * @author Damian
   * @date 18/07/2025
   * @param {string} clientId
   * @param {string} language
   * @returns {*}
   * @memberof ClientsService
   */
  async getClientContactPoints(clientId: string, language: string) {
    try {
      const storedClient = await this.findOne({
        filterOptions: {
          _id: clientId,
        },
        populateOptions: [
          {
            path: 'contactPoints',
            select: ['-history', '-createdAt', '-updatedAt'],
          },
        ],
      });

      //filter language map
      return filterLanguageMap(
        storedClient.contactPoints.map((contactPoint) => contactPoint.toJSON()),
        language,
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async countDocuments() {
    return this.clientModel.countDocuments();
  }
}
