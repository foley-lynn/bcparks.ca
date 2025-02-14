import React, { useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Breadcrumbs, Link } from "@material-ui/core"

import Header from "../../../components/header"
import Footer from "../../../components/footer"
import Seo from "../../../components/seo"
import ScrollToTop from "../../../components/scrollToTop"

import "../../../styles/listPage.scss"

const DocumentLink = ({ park }) => {
  const docs = park.managementDocuments
  const calcYear = (date) => date.split('-').shift()
  const checkRelation = (orcs, orcsSite) => {
    return orcs.toString() === orcsSite.split("-")[0]
  }
  // sorting links based on full link text
  const titles = []
  docs?.map((doc, index) => (
    doc.sites.length > 0 ? (
      // display link with siteName if there's a relation with site
      doc.sites.map(site =>
        checkRelation(park.orcs, site.orcsSiteNumber) && (
          titles.push({
            index: index,
            title: `${park.protectedAreaName} - ${site.siteName} ${(doc.documentType?.documentType)?.toLowerCase()} (${calcYear(doc.documentDate)})`
          })
        ))
    ) : (
      titles.push({
        index: index,
        title: `${park.protectedAreaName} ${(doc.documentType?.documentType)?.toLowerCase()} (${calcYear(doc.documentDate)})`
      })
    )
  ))
  titles.sort((a, b) => {
    // compare strings without hyphens and spaces
    const titleA = a.title.replace(/-|\s/g, "").toLowerCase()
    const titleB = b.title.replace(/-|\s/g, "").toLowerCase()
    if (titleA < titleB) { return -1 }
    if (titleA > titleB) { return 1 }
    return 0;
  })

  return (
    titles.map((title, index) => (
      <p key={index}>
        <a href={docs[title.index].url} target="_blank" rel="noreferrer">
          {`${title.title} [PDF]`}
        </a>
      </p>
    ))
  )
}

const ApprovedListPage = () => {
  const queryData = useStaticQuery(graphql`
    query {
      allStrapiProtectedArea(
        sort: {fields: protectedAreaName, order: ASC}
        filter: {managementDocuments: {elemMatch: {publishedAt: {ne: null}}}}
      ) {
        nodes {
          orcs
          protectedAreaName
          managementDocuments {
            url
            documentDate
            documentType {
              documentType
            }
            sites {
              orcsSiteNumber
              siteName
            }
          }
        }
      }
      allStrapiMenu(
        sort: { fields: order, order: ASC }
        filter: { show: { eq: true } }
      ) {
        nodes {
          strapi_id
          title
          url
          order
          id
          strapi_children {
            id
            title
            url
            order
          }
          strapi_parent {
            id
            title
          }
        }
      }
    }
  `)

  const menuContent = queryData?.allStrapiMenu?.nodes || []
  const parks = queryData?.allStrapiProtectedArea?.nodes || []

  const [currentFilter, setCurrentFilter] = useState("All")

  const handleClick = (e) => {
    setCurrentFilter(e.target.value)
  }
  const filtering = (char) =>
    parks.filter(park => park.protectedAreaName.charAt(0).toUpperCase() === char)

  const filters = [
    "All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ]
  const breadcrumbs = [
    <Link key="1" href="/">
      Home
    </Link>,
    <Link key="2" href="/about">
      About
    </Link>,
    <Link key="3" href="/about/management-plans">
      Management plans
    </Link>,
    <div key="4" className="breadcrumb-text">
      Approved management plans
    </div>,
  ]

  return (
    <>
      <ScrollToTop />
      <div className="max-width-override">
        <Header mode="internal" content={menuContent} />
      </div>
      <div id="sr-content" className="d-none d-md-block static-content-container page-breadcrumbs">
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {breadcrumbs}
        </Breadcrumbs>
      </div>
      <div className="static-content--header">
        <h1 className="header-title">
          Approved management plans
        </h1>
      </div>

      <div className="static-content-container">
        <div className="page-content-wrapper">
          <div>
            <h3>Filter</h3>
            <div className="filters">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  value={filter}
                  onClick={(e) => handleClick(e, filter)}
                  className={
                    `btn btn-selected--${
                      currentFilter === filter ? 'true' : 'false'
                    }`
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="lists">
            {currentFilter === "All" ? (
              filters.map((filter, index) => (
                <div key={index} className="list">
                  {filter !== "All" && <h3>{filter}</h3>}
                  {filtering(filter).map((park, index) => (
                    <DocumentLink park={park} key={index} />
                  ))}
                </div>
              ))
            ) : (
              <div className="list">
                <h3>{currentFilter}</h3>
                {filtering(currentFilter).map((park, index) => (
                  <DocumentLink park={park} key={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-width-override">
        <Footer />
      </div>
    </>
  )
}

export default ApprovedListPage

export const Head = () => (
  <Seo title="Approved management plans" />
)
