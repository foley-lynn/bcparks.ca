"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const updateName = async (data, where) => {
  if (where) {
    const id = where.id
    const parkActivity = await strapi.entityService.findOne(
      "api::park-activity.park-activity", id, { populate: '*'}
    )
    const protectedArea = parkActivity.protectedArea
    const site = parkActivity.site
    const activityType = parkActivity.activityType
  
    data.name = ""
    if (protectedArea) {
      data.name = protectedArea.orcs
    }
    if (site) {
      data.name = site.orcsSiteNumber
    }
    if (activityType) {
      data.name += ":"
      data.name += activityType.activityName;
    }
  }
  return data
};

module.exports = {
  async beforeCreate(event) {
    let { data, where } = event.params;
    data = await updateName(data, where);
  },
  async beforeUpdate(event) {
    let { data, where } = event.params;
    data = await updateName(data, where);
  },
};
