import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./ParkInfo.css";
import { Redirect, useParams } from "react-router-dom";
import { Loader } from "../../shared/loader/Loader";
import { useKeycloak } from "@react-keycloak/web";
import Header from "../../composite/header/Header";
import { cmsAxios } from "../../../axios_config";
import { getRegions, getSections } from "../../../utils/CmsDataUtil";
import { Button } from "../../shared/button/Button";
import { a11yProps } from "../../../utils/AppUtil";
import {
  Tab,
  Tabs,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  TextField,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import moment from "moment";
import SwitchButton from "../../base/switchButton/SwitchButton";
import TabPanel from "../../base/tabPanel/TabPanel";
import HTMLArea from "../../base/HTMLArea/HTMLArea";

const qs = require('qs');

export default function ParkInfo({ page: { setError, cmsData, setCmsData } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [toError, setToError] = useState(false);
  const [toDashboard, setToDashboard] = useState(false);
  const [protectedArea, setProtectedArea] = useState();
  const [expandedActivities, setExpandedActivities] = useState([]);
  const [editableActivities, setEditableActivities] = useState([]);
  const [expandedFacilities, setExpandedFacilities] = useState([]);
  const [editableFacilities, setEditableFacilities] = useState([]);
  const [parkActivities, setParkActivities] = useState([]);
  const [parkFacilities, setParkFacilities] = useState([]);
  const [submittingActivities, setSubmittingActivities] = useState([]);
  const [submittingFacilities, setSubmittingFacilities] = useState([]);
  const [loadParkInfo, setLoadParkInfo] = useState(true);
  const { keycloak, initialized } = useKeycloak();
  const { id } = useParams();

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const query = qs.stringify({
      populate: [
        'managementAreas',
        'managementAreas.region',
        'managementAreas.section',
        'parkActivities',
        'parkActivities.activityType',
        'parkActivities.protectedArea',
        'parkActivities.site',
        'parkFacilities',
        'parkFacilities.facilityType',
        'parkFacilities.protectedArea',
        'parkFacilities.site',
      ],
      filters: {
        orcs: {
          $eq: `${id}`,
        },
      },
    }, {
        encodeValuesOnly: true,
    })

    if (initialized && keycloak && loadParkInfo) {
      Promise.all([
        cmsAxios.get(`/protected-areas?${query}`),
        getRegions(cmsData, setCmsData),
        getSections(cmsData, setCmsData),
      ])
        .then((res) => {
          const protectedAreaData = res[0].data.data[0];
          if (protectedAreaData.attributes.managementAreas.data.length > 0) {
            const managementArea = protectedAreaData.attributes.managementAreas.data[0].attributes;
            protectedAreaData.managementAreaName =
              managementArea.managementAreaName;
            const region = cmsData.regions.filter(
              (r) => r.id === managementArea.region.data.id
            );
            if (region.length > 0) {
              protectedAreaData.regionName = region[0].regionName;
            }
            const section = cmsData.sections.filter(
              (s) => s.id === managementArea.section.data.id
            );
            if (section.length > 0) {
              protectedAreaData.sectionName = section[0].sectionName;
            }
          }
          if (protectedAreaData.attributes.parkActivities.data) {
            const activities = [];
            protectedAreaData.attributes.parkActivities.data.map((activity) => {
              return activities.push({
                id: activity.id,
                description: activity.attributes.description,
                name: activity.attributes.name,
                isActivityOpen: activity.attributes.isActivityOpen,
                isActive: activity.attributes.isActive,
                protectedArea: activity.attributes.protectedArea.data,
                site: activity.attributes.site.data,
                activityType: activity.attributes.activityType.data,
              });
            });
            if (isMounted) {
              setParkActivities([...activities]);
            }
          }
          if (protectedAreaData.attributes.parkFacilities.data) {
            const facilities = [];
            protectedAreaData.attributes.parkFacilities.data.map((facility) => {
              return facilities.push({
                id: facility.id,
                description: facility.attributes.description,
                name: facility.attributes.name,
                isFacilityOpen: facility.attributes.isFacilityOpen,
                isActive: facility.attributes.isActive,
                protectedArea: facility.attributes.protectedArea.data,
                site: facility.attributes.site.data,
                facilityType: facility.attributes.facilityType.data,
              });
            });
            if (isMounted) {
              setParkFacilities([...facilities]);
            }
          }
          if (isMounted) {
            setProtectedArea(protectedAreaData);
            setIsLoading(false);
            setLoadParkInfo(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setToError(true);
            setError({
              status: 500,
              message: "Error fetching park information",
            });
            setIsLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [
    cmsData,
    id,
    initialized,
    keycloak,
    setCmsData,
    setError,
    setIsLoading,
    loadParkInfo,
    setProtectedArea,
    setToError,
    setLoadParkInfo,
    setParkActivities,
    setParkFacilities
  ]);

  const handleTabChange = (event, val) => {
    setTabIndex(val);
  };

  const handleActivityAccordionChange = (event, isExpanded, activityId) => {
    if (isExpanded) {
      const currentActivities = [...expandedActivities, activityId];
      setExpandedActivities([...currentActivities]);
    } else {
      const currentActivities = expandedActivities.filter(
        (a) => a !== activityId
      );
      setExpandedActivities([...currentActivities]);
    }
  };

  const editActivityDesc = (activityId) => {
    const currentActivities = [...editableActivities, activityId];
    setEditableActivities([...currentActivities]);
  };

  const cancelEditActivityDesc = (activityId) => {
    const currentActivity = parkActivities.filter(
      (a) => a.id === activityId
    )[0];
    const unchangedActivity = protectedArea.attributes.parkActivities.data.filter(
      (a) => a.id === activityId
    )[0];
    currentActivity.description = unchangedActivity.attributes.description;
    finishEditActivityDesc(activityId, true);
  };

  const finishEditActivityDesc = (activityId, expand) => {
    const currentActivities = editableActivities.filter(
      (a) => a !== activityId
    );
    setEditableActivities([...currentActivities]);
    handleActivityAccordionChange(null, expand, activityId);
  };
  const handleActivityDescriptionChange = (event, activityId) => {
    const currentDescriptions = parkActivities;
    currentDescriptions.filter((d) => {
      if (d.id === activityId) {
        d.description = event.target.value;
      }
      return "";
    });
    setParkActivities([...currentDescriptions]);
  };

  const handleActivityDisplayChange = (activityId) => {
    const currentActivities = parkActivities;
    currentActivities.filter((d) => {
      if (d.id === activityId) {
        d.isActive = !d.isActive;
      }
      return "";
    });
    setParkActivities([...currentActivities]);
    saveActivity(activityId, false);
  };

  const handleActivityOpenChange = (activityId) => {
    const currentActivities = parkActivities;
    currentActivities.filter((d) => {
      if (d.id === activityId) {
        d.isActivityOpen = !d.isActivityOpen;
      }
      return "";
    });
    setParkActivities([...currentActivities]);
    saveActivity(activityId, false);
  };

  const handleActivitySubmitLoader = (activityId) => {
    const currentActivities = [...submittingActivities, activityId];
    setSubmittingActivities([...currentActivities]);
  };

  const saveActivity = (activityId, expand) => {
    const activities = parkActivities.filter((d) => d.id === activityId);
    if (activities.length > 0) {
      const activity = activities[0];
      const parkActivity = {
        name: activity.name,
        description: activity.description,
        isActivityOpen: activity.isActivityOpen,
        isActive: activity.isActive,
        modifiedBy: keycloak.tokenParsed.name,
        modifiedDate: moment().toISOString(),
        protectedArea: activity.protectedArea,
        site: activity.site,
        activityType: activity.activityType,
      };
      cmsAxios
        .put(`park-activities/${activityId}`, {data:parkActivity}, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        })
        .then((res) => {
          const currentActivities = submittingActivities.filter(
            (a) => a !== activityId
          );
          setSubmittingActivities([...currentActivities]);
          finishEditActivityDesc(activityId, expand);
          setLoadParkInfo(true);
        })
        .catch((error) => {
          console.log("error occurred", error);
          setToError(true);
          setError({
            status: 500,
            message: "Could not update activity",
          });
        });
    }
  };

  const handleFacilityAccordionChange = (event, isExpanded, facilityId) => {
    if (isExpanded) {
      const currentFacilities = [...expandedFacilities, facilityId];
      setExpandedFacilities([...currentFacilities]);
    } else {
      const currentFacilities = expandedFacilities.filter(
        (f) => f !== facilityId
      );
      setExpandedFacilities([...currentFacilities]);
    }
  };

  const editFacilityDesc = (facilityId) => {
    const currentFacilities = [...editableFacilities, facilityId];
    setEditableFacilities([...currentFacilities]);
  };

  const cancelEditFacilityDesc = (facilityId) => {
    const currentFacility = parkFacilities.filter(
      (f) => f.id === facilityId
    )[0];
    const unchangedFacility = protectedArea.attributes.parkFacilities.data.filter(
      (f) => f.id === facilityId
    )[0];
    currentFacility.description = unchangedFacility.attributes.description;
    finishEditFacilityDesc(facilityId, true);
  };

  const finishEditFacilityDesc = (facilityId, expand) => {
    const currentFacilities = editableFacilities.filter(
      (f) => f !== facilityId
    );
    setEditableFacilities([...currentFacilities]);
    handleFacilityAccordionChange(null, expand, facilityId);
  };
  const handleFacilityDescriptionChange = (event, facilityId) => {
    const currentDescriptions = parkFacilities;
    currentDescriptions.filter((d) => {
      if (d.id === facilityId) {
        d.description = event.target.value;
      }
      return "";
    });
    setParkFacilities([...currentDescriptions]);
  };

  const handleFacilityDisplayChange = (facilityId) => {
    const currentFacilities = parkFacilities;
    currentFacilities.filter((d) => {
      if (d.id === facilityId) {
        d.isActive = !d.isActive;
      }
      return "";
    });
    setParkFacilities([...currentFacilities]);
    saveFacility(facilityId, false);
  };

  const handleFacilityOpenChange = (facilityId) => {
    const currentFacilities = parkFacilities;
    currentFacilities.filter((d) => {
      if (d.id === facilityId) {
        d.isFacilityOpen = !d.isFacilityOpen;
      }
      return "";
    });
    setParkFacilities([...currentFacilities]);
    saveFacility(facilityId, false);
  };

  const handleFacilitySubmitLoader = (facilityId) => {
    const currentFacilities = [...submittingFacilities, facilityId];
    setSubmittingFacilities([...currentFacilities]);
  };

  const saveFacility = (facilityId, expand) => {
    const facilities = parkFacilities.filter((d) => d.id === facilityId);
    if (facilities.length > 0) {
      const facility = facilities[0];
      const parkFacility = {
        name: facility.name,
        description: facility.description,
        isFacilityOpen: facility.isFacilityOpen,
        isActive: facility.isActive,
        modifiedBy: keycloak.tokenParsed.name,
        modifiedDate: moment().toISOString(),
        protectedArea: facility.protectedArea,
        site: facility.site,
        facilityType: facility.facilityType,
      };
      cmsAxios
        .put(`park-facilities/${facilityId}`, {data:parkFacility}, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        })
        .then((res) => {
          const currentFacilities = submittingFacilities.filter(
            (f) => f !== facilityId
          );
          setSubmittingFacilities([...currentFacilities]);
          finishEditFacilityDesc(facilityId, expand);
          setLoadParkInfo(true);
        })
        .catch((error) => {
          console.log("error occurred", error);
          setToError(true);
          setError({
            status: 500,
            message: "Could not update facility",
          });
        });
    }
  };

  if (toDashboard) {
    return (
      <Redirect
        push
        to={{
          pathname: `/bcparks/dashboard`,
          index: 2,
        }}
      />
    );
  }
  if (toError) {
    return <Redirect push to="/bcparks/error" />;
  }

  return (
    <main>
      <Header />
      <br />
      <div className="ParkInfo" data-testid="ParkInfo">
        <div className="container">
          {isLoading && (
            <div className="page-loader">
              <Loader page />
            </div>
          )}
          {!isLoading && (
            <div className="container-fluid">
              <div className="container-fluid">
                <Button
                  label="Back"
                  styling="bcgov-normal-white btn mt10"
                  onClick={() => {
                    setToDashboard(true);
                  }}
                />
              </div>
              <br />
              <div className="pt10b30">
                <div className="container-fluid">
                  <h3>{protectedArea.attributes.protectedAreaName}</h3>
                  {protectedArea.regionName && (
                    <div>{protectedArea.regionName} Region</div>
                  )}
                  {protectedArea.sectionName && (
                    <div>{protectedArea.sectionName} Section</div>
                  )}
                  {protectedArea.managementAreaName && (
                    <div>
                      {protectedArea.managementAreaName} Management Area
                    </div>
                  )}
                </div>
                <div className="container park-tabs mt20">
                  <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="Park-Info"
                    className="park-tab"
                    variant="fullWidth"
                  >
                    <Tab label="Activities" {...a11yProps(0, "park-info")} />
                    <Tab label="Facilities" {...a11yProps(1, "park-info")} />
                  </Tabs>
                  <TabPanel value={tabIndex} index={0} label="park-info">
                    {parkActivities &&
                      parkActivities.length > 0 && (
                        <div>
                          <div className="row pt2b2">
                            <div className="col-lg-3 col-md-12 col-12 park-header">
                              Activity
                            </div>
                            <div className="col-lg-1 col-md-12 col-12 park-header">
                              Display
                            </div>
                            <div className="col-lg-1 col-md-12 col-12 park-header">
                              Open
                            </div>
                            <div className="col-lg-3 col-md-12 col-12 park-header">
                              Fees
                            </div>
                            <div className="col-lg-4 col-md-12 col-12 park-header no-right-border">
                              Description
                            </div>
                          </div>
                          {parkActivities.map((a) => {
                            return (
                              <div
                                className="row pt2b2"
                                key={`activity-${a.id}`}
                              >
                                <div className="col-lg-3 col-md-12 col-12 park-content">
                                  {a.name.split(":")[1]}
                                </div>
                                <div className="col-lg-1 col-md-12 col-12 park-content">
                                  <SwitchButton
                                    checked={a.isActive}
                                    name={`${a.id}-is-active`}
                                    inputProps={{
                                      "aria-label": "active activity",
                                    }}
                                    onChange={() => {
                                      handleActivityDisplayChange(a.id);
                                    }}
                                  />
                                </div>
                                <div className="col-lg-1 col-md-12 col-12 park-content">
                                  <SwitchButton
                                    checked={a.isActivityOpen}
                                    name={`${a.id}-is-open`}
                                    inputProps={{
                                      "aria-label": "open activity",
                                    }}
                                    onChange={() => {
                                      handleActivityOpenChange(a.id);
                                    }}
                                  />
                                </div>
                                <div className="col-lg-3 col-md-12 col-12 park-content">
                                  Add a fee
                                </div>
                                <div className="col-lg-4 col-md-12 col-12 park-content no-right-border">
                                  <div className="wrap-text">
                                    <Accordion
                                      onChange={(event, isExpanded) => {
                                        handleActivityAccordionChange(
                                          event,
                                          isExpanded,
                                          a.id
                                        );
                                      }}
                                      className="park-desc"
                                      expanded={expandedActivities.includes(
                                        a.id
                                      )}
                                    >
                                      <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="activity-description"
                                        id="activity-description"
                                      >
                                        {!expandedActivities.includes(a.id) && (
                                          <HTMLArea>
                                            {a.description
                                              ? a.description.length < 100
                                                ? a.description
                                                : a.description.substring(
                                                  0,
                                                    100
                                                  ) + "..."
                                              : "No description"}
                                          </HTMLArea>
                                        )}
                                      </AccordionSummary>

                                      <AccordionDetails className="">
                                        {!editableActivities.includes(a.id) && (
                                          <HTMLArea>
                                            {a.description
                                              ? a.description
                                              : "No description"}
                                          </HTMLArea>
                                        )}
                                        {editableActivities.includes(a.id) && (
                                          <TextField
                                            multiline
                                            value={a.description || ""}
                                            onChange={(event) => {
                                              handleActivityDescriptionChange(
                                                event,
                                                a.id
                                              );
                                            }}
                                            className="bcgov-input white-background"
                                            variant="outlined"
                                            InputProps={{
                                              id: `activity-${a.id}-desc`,
                                              required: false,
                                              placeholder:
                                                "Enter activity description",
                                            }}
                                          />
                                        )}
                                      </AccordionDetails>
                                      <AccordionActions>
                                        {!editableActivities.includes(a.id) && (
                                          <Button
                                            label="Edit"
                                            styling="bcgov-normal-blue btn mt10"
                                            onClick={() => {
                                              editActivityDesc(a.id);
                                            }}
                                          />
                                        )}
                                        {editableActivities.includes(a.id) && (
                                          <>
                                            <Button
                                              label="Cancel"
                                              styling="bcgov-normal-white btn mt10"
                                              onClick={() => {
                                                cancelEditActivityDesc(a.id);
                                              }}
                                            />
                                            <Button
                                              label="Save"
                                              styling="bcgov-normal-blue btn mt10"
                                              onClick={() => {
                                                handleActivitySubmitLoader(
                                                  a.id
                                                );
                                                saveActivity(a.id, true);
                                              }}
                                              hasLoader={submittingActivities.includes(
                                                a.id
                                              )}
                                            />
                                          </>
                                        )}
                                      </AccordionActions>
                                    </Accordion>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    {!parkActivities ||
                      (parkActivities.length === 0 && (
                        <div className="park-empty-info">
                          No activities found
                        </div>
                      ))}
                  </TabPanel>
                  <TabPanel value={tabIndex} index={1} label="park-info">
                    {parkFacilities &&
                      parkFacilities.length > 0 && (
                        <div>
                          <div className="row pt2b2">
                            <div className="col-lg-3 col-md-12 col-12 park-header">
                              Facilities
                            </div>
                            <div className="col-lg-1 col-md-12 col-12 park-header">
                              Display
                            </div>
                            <div className="col-lg-1 col-md-12 col-12 park-header">
                              Open
                            </div>
                            <div className="col-lg-3 col-md-12 col-12 park-header">
                              Fees
                            </div>
                            <div className="col-lg-4 col-md-12 col-12 park-header no-right-border">
                              Description
                            </div>
                          </div>
                          {parkFacilities.map((f) => {
                            return (
                              <div
                                className="row pt2b2"
                                key={`facility-${f.id}`}
                              >
                                <div className="col-lg-3 col-md-12 col-12 park-content">
                                  {f.name.split(":")[1]}
                                </div>
                                <div className="col-lg-1 col-md-12 col-12 park-content">
                                  <SwitchButton
                                    checked={f.isActive}
                                    name={`${f.id}-is-active`}
                                    inputProps={{
                                      "aria-label": "active facility",
                                    }}
                                    onChange={() => {
                                      handleFacilityDisplayChange(f.id);
                                    }}
                                  />
                                </div>
                                <div className="col-lg-1 col-md-12 col-12 park-content">
                                  <SwitchButton
                                    checked={f.isFacilityOpen}
                                    name={`${f.id}-is-open`}
                                    inputProps={{
                                      "aria-label": "open facility",
                                    }}
                                    onChange={() => {
                                      handleFacilityOpenChange(f.id);
                                    }}
                                  />
                                </div>
                                <div className="col-lg-3 col-md-12 col-12 park-content">
                                  Add a fee
                                </div>
                                <div className="col-lg-4 col-md-12 col-12 park-content no-right-border">
                                  <div className="wrap-text">
                                    <Accordion
                                      onChange={(event, isExpanded) => {
                                        handleFacilityAccordionChange(
                                          event,
                                          isExpanded,
                                          f.id
                                        );
                                      }}
                                      className="park-desc"
                                      expanded={expandedFacilities.includes(
                                        f.id
                                      )}
                                    >
                                      <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="facility-description"
                                        id="facility-description"
                                      >
                                        {!expandedFacilities.includes(f.id) && (
                                          <HTMLArea>
                                            {f.description
                                              ? f.description.length <
                                                100
                                                ? f.description
                                                : f.description.substring(
                                                    0,
                                                    100
                                                  ) + "..."
                                              : "No description"}
                                          </HTMLArea>
                                        )}
                                      </AccordionSummary>

                                      <AccordionDetails className="">
                                        {!editableFacilities.includes(f.id) && (
                                          <HTMLArea>
                                            {f.description
                                              ? f.description
                                              : "No description"}
                                          </HTMLArea>
                                        )}
                                        {editableFacilities.includes(f.id) && (
                                          <TextField
                                            multiline
                                            value={f.description || ""}
                                            onChange={(event) => {
                                              handleFacilityDescriptionChange(
                                                event,
                                                f.id
                                              );
                                            }}
                                            className="bcgov-input white-background"
                                            variant="outlined"
                                            InputProps={{
                                              id: `facility-${f.id}-desc`,
                                              required: false,
                                              placeholder:
                                                "Enter facility description",
                                            }}
                                          />
                                        )}
                                      </AccordionDetails>
                                      <AccordionActions>
                                        {!editableFacilities.includes(f.id) && (
                                          <Button
                                            label="Edit"
                                            styling="bcgov-normal-blue btn mt10"
                                            onClick={() => {
                                              editFacilityDesc(f.id);
                                            }}
                                          />
                                        )}
                                        {editableFacilities.includes(f.id) && (
                                          <>
                                            <Button
                                              label="Cancel"
                                              styling="bcgov-normal-white btn mt10"
                                              onClick={() => {
                                                cancelEditFacilityDesc(f.id);
                                              }}
                                            />
                                            <Button
                                              label="Save"
                                              styling="bcgov-normal-blue btn mt10"
                                              onClick={() => {
                                                handleFacilitySubmitLoader(
                                                  f.id
                                                );
                                                saveFacility(f.id, true);
                                              }}
                                              hasLoader={submittingFacilities.includes(
                                                f.id
                                              )}
                                            />
                                          </>
                                        )}
                                      </AccordionActions>
                                    </Accordion>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    {!parkFacilities ||
                      (parkFacilities.length === 0 && (
                        <div className="park-empty-info">
                          No facilities found
                        </div>
                      ))}
                  </TabPanel>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

ParkInfo.propTypes = {
  page: PropTypes.shape({
    setError: PropTypes.func.isRequired,
    cmsData: PropTypes.object.isRequired,
    setCmsData: PropTypes.func.isRequired,
  }).isRequired,
};
