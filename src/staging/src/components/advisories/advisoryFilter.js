import React, { useState } from "react"
import { navigate } from "@reach/router"
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  NativeSelect,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import SearchIcon from "@material-ui/icons/Search"
import "../../styles/advisories/advisoryFilter.scss"

const useStyles = makeStyles(theme => ({
  searchBox: {
    marginRight: "10px",
    width: "100%",
  },
  typeSelect: {
    width: "100%",
    borderRadius: "4px",
    paddingLeft: "8px",
    border: "solid 1px #aaa",
    "&::before": {
      borderBottom: 0,
    },
  },
  filterElement: {
    [theme.breakpoints.up("sm")]: {
      marginRight: "4%",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "15px",
      marginLeft: "10px",
      "& .MuiCheckbox-root": {
        marginRight: "0px",
        paddingRight: "5px",
      },
    },
  },
  filterSearch: {
    [theme.breakpoints.down("sm")]: {
      width: "99%",
    },
    [theme.breakpoints.up("sm")]: {
      width: "25%",
    },
  },
  filterType: {
    [theme.breakpoints.down("sm")]: {
      width: "60%",
    },
    [theme.breakpoints.up("sm")]: {
      width: "15%",
    },
  },
  filterLabel: {
    fontWeight: "bold",
    fontSize: "1rem",
    lineHeight: "1.75rem",
    color: "#000",
    fontFamily: "unset",
    marginBottom: "0px",
  },
  filterBy: {
    [theme.breakpoints.up("sm")]: {
      display: "inline-flex",
      marginRight: "15px",
      verticalAlign: "middle",
      marginBottom: "10px",
    },
  },
}))

const AdvisoryFilter = ({ filterFunctions }) => {
  const classes = useStyles()

  // Get parent's filter functions
  const getSearchText = filterFunctions.getSearchText
  const setSearchText = filterFunctions.setSearchText
  const setFilter = filterFunctions.setFilter
  const getFilter = filterFunctions.getFilter
  const getType = filterFunctions.getType
  const setType = filterFunctions.setType

  const [filterText, setFilterText] = useState(getSearchText())
  const [isParksFilter, setIsParksFilter] = useState(getFilter("parks"))
  const [isKeywordFilter, setIsKeywordsFilter] = useState(getFilter("keyword"))

  // Local handlers, calls to parent methods
  // will trigger useEffect functions in parent
  const updateAdvisoriesSearchText = str => {
    setSearchText(str)
  }
  const handleSearch = () => {
    setSearchText(filterText)
  }

  const handleTypeFilterChange = advisoryType => {
    // This changes the URL query str and causes the page to
    // rerender with the type changed
    setType(advisoryType)
    const updatedPath = `/alerts/?type=${advisoryType}${
      advisoryType === "public" ? "" : "s"
    }`
    navigate(updatedPath)
  }

  // Checkboxes
  const handleParksFilterChange = () => {
    setIsParksFilter(!isParksFilter)
    setFilter("parks", !isParksFilter)
  }
  const handleKeywordsFilterChange = () => {
    setIsKeywordsFilter(!isKeywordFilter)
    setFilter("keywords", !isKeywordFilter)
  }

  return (
    <div className="advisory-filter-container">
      <div className="row">
        <div className="col-12 col-md-6">
          <label htmlFor="advisory-search-text" className={classes.filterLabel}>
            Search
          </label>
          <TextField
            id="advisory-search-text"
            variant="outlined"
            placeholder="Search"
            className={classes.searchBox + " h50p"}
            value={filterText}
            onChange={event => {
              setFilterText(event.target.value)
            }}
            onKeyPress={ev => {
              if (ev.key === "Enter") {
                updateAdvisoriesSearchText(filterText)
                ev.preventDefault()
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="search-icon" />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="col-7 col-md-4">
          <label htmlFor="advisory-type" className={classes.filterLabel}>
            Event
          </label>
          <NativeSelect
            value={getType()}
            id="advisory-type"
            className={classes.typeSelect + " h50p"}
            variant="outlined"
            onChange={event => {
              handleTypeFilterChange(event.target.value)
            }}
            placeholder="Event"
          >
            <option value="public">All</option>
            <option value="wildfire">Wildfires</option>
            <option value="flood">Floods</option>
          </NativeSelect>
        </div>
        <div className="col-5 col-md-2">
          <label htmlFor="search-button" className={classes.filterLabel}>
            &nbsp;
          </label>
          <Button
            id="search-button"
            variant="contained"
            fullWidth
            onClick={() => {
              handleSearch()
            }}
            className="bcgov-normal-blue mobile-search-element-height h50p"
          >
            Search
          </Button>
        </div>
      </div>

      <Box sx={{ marginTop: "10px" }}>
        <Box className={classes.filterBy}>
          <b>Filters</b>
        </Box>
        <FormControlLabel
          className={
            classes.filterElement +
            " " +
            (isKeywordFilter ? "text-light-blue no-wrap" : "no-wrap")
          }
          control={
            <Checkbox
              checked={isKeywordFilter}
              style={{ color: "#38598a" }}
              onChange={event => {
                handleKeywordsFilterChange()
              }}
              name="keywords"
            />
          }
          label="Keywords"
        />
        <FormControlLabel
          className={
            classes.filterElement +
            " " +
            (isParksFilter ? "text-light-blue no-wrap" : "no-wrap")
          }
          control={
            <Checkbox
              checked={isParksFilter}
              style={{ color: "#38598a" }}
              onChange={event => {
                handleParksFilterChange()
              }}
              name="parks"
            />
          }
          label="Park Names"
        />
      </Box>
    </div>
  )
}

export default AdvisoryFilter
