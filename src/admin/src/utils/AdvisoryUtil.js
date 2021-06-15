import moment from "moment";
import { apiAxios, axios } from "../axios_config";

export function calculateAfterHours(businessHours) {
  const currentDate = moment().format("YYYY-MM-DD");
  const currentDay = moment().format("dddd");
  const businessStartTime = moment(
    currentDate + " " + businessHours["startTime"]
  );
  const businessEndTime = moment(currentDate + " " + businessHours["endTime"]);
  const businessHour = moment().isBetween(businessStartTime, businessEndTime);
  if (!businessHours[currentDay.toLowerCase()] || !businessHour) {
    return true;
  }
  return false;
}

export function calculateStatHoliday(statData) {
  for (let hol of statData["province"]["holidays"]) {
    if (moment(hol["date"]).isSame(Date.now(), "day")) {
      return true;
    }
  }
  return false;
}

function isLatestStatutoryHolidayList(statData) {
  for (let hol of statData["province"]["holidays"]) {
    if (!moment(hol["date"]).isSame(Date.now(), "year")) {
      return false;
    }
  }
  return true;
}

export function getSubmitterAdvisoryFields(
  type,
  advisoryStatuses,
  setConfirmationText
) {
  let status = {};
  let published = null;
  if (type === "draft") {
    status = advisoryStatuses.filter((s) => s.code === "DFT");
    setConfirmationText("Your advisory has been saved successfully!");
  } else if (type === "publish") {
    status = advisoryStatuses.filter((s) => s.code === "PUB");
    setConfirmationText("Your advisory has been published successfully!");
    published = moment().tz("America/Vancouver");
  } else {
    status = advisoryStatuses.filter((s) => s.code === "ARQ");
    setConfirmationText("Your advisory has been sent for review successfully!");
  }
  return { status: status[0]["value"], published: published };
}

export function getApproverAdvisoryFields(code, setConfirmationText) {
  let published = null;
  if (code === "PUB") {
    setConfirmationText("Your advisory has been published successfully!");
    published = moment().tz("America/Vancouver");
  } else {
    setConfirmationText("Your advisory has been saved successfully!");
  }
  return published;
}

function addProtectedAreas(area, field, selProtectedAreas) {
  area[field].forEach((f) => {
    selProtectedAreas.push(f.protectedArea);
  });
}

export function getLocationSelection(
  selectedProtectedAreas,
  selectedRegions,
  selectedSections,
  selectedManagementAreas,
  selectedSites,
  selectedFireCentres,
  selectedFireZones
) {
  const selProtectedAreas = [];
  const selRegions = [];
  const selSections = [];
  const selManagementAreas = [];
  const selSites = [];
  const selFireCentres = [];
  const selFireZones = [];
  setAreaValues(selectedProtectedAreas, selProtectedAreas, null);
  setAreaValues(selectedRegions, selRegions, selProtectedAreas);
  setAreaValues(selectedSections, selSections, selProtectedAreas);
  setAreaValues(selectedManagementAreas, selManagementAreas, selProtectedAreas);
  setAreaValues(selectedSites, selSites, selProtectedAreas);
  setAreaValues(selectedFireCentres, selFireCentres, selProtectedAreas);
  setAreaValues(selectedFireZones, selFireZones, selProtectedAreas);
  return {
    selProtectedAreas,
    selRegions,
    selSections,
    selManagementAreas,
    selSites,
    selFireCentres,
    selFireZones,
  };
}

const setAreaValues = (areas, selAreas, selProtectedAreas) => {
  if (areas && areas.length > 0) {
    areas.forEach((a) => {
      selAreas.push(a.value);
      if (
        a.type === "managementArea" ||
        a.type === "fireZone" ||
        a.type === "site"
      ) {
        selProtectedAreas.push(a.obj.protectedArea.id);
      } else if (a.type === "region" || a.type === "section") {
        addProtectedAreas(a.obj, "managementAreas", selProtectedAreas);
      } else if (a.type === "fireCentre") {
        addProtectedAreas(a.obj, "fireZones", selProtectedAreas);
      }
    });
  }
};

export function calculateIsStatHoliday(
  setIsStatHoliday,
  cmsData,
  setCmsData,
  token
) {
  if (!cmsData.statutoryHolidays) {
    Promise.resolve(
      apiAxios
        .get(`api/get/statutory-holidays`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const statData = res.data.data;
          if (
            Object.keys(statData).length === 0 ||
            !isLatestStatutoryHolidayList(statData)
          ) {
            throw new Error("Obsolete Holiday List");
          }
          const data = cmsData;
          data.statutoryHolidays = statData;
          setCmsData(data);
          setIsStatHoliday(calculateStatHoliday(statData));
        })
        .catch((err) => {
          console.log(err);
          // Call Statutory Holiday API if CMS cache is not available
          axios
            .get(process.env.REACT_APP_STAT_HOLIDAY_API)
            .then((res) => {
              const statInfo = { data: res.data };
              setIsStatHoliday(calculateStatHoliday(res.data));
              const data = cmsData;
              data.statutoryHolidays = res.data;
              setCmsData(data);
              // Write Statutory Data to CMS cache
              apiAxios
                .put(`api/update/statutory-holidays`, statInfo, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .catch((error) => {
                  console.log(
                    "error occurred writing statutory holidays to cms",
                    error
                  );
                });
            })
            .catch((error) => {
              setIsStatHoliday(false);
              console.log(
                "error occurred fetching statutory holidays from API",
                error
              );
            });
        })
    );
  } else {
    setIsStatHoliday(calculateStatHoliday(cmsData.statutoryHolidays));
  }
}
