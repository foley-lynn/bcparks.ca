import React from "react"

import HTMLArea from "../HTMLArea"

import "../../styles/pageContent/pageSection.scss"

export default function PageSection({ sectionId, sectionStrapiId, sectionTitle, sectionHtml})
{
    return (
        <>
            <span id={`page-section-${sectionStrapiId}`}></span>		
            <div className="page-section" id={"page-section-" + sectionId}>
                <h2 className="page-section-title">{sectionTitle}</h2>
                <HTMLArea className="page-section-html" isVisible={true}>
                    {sectionHtml.data.sectionHTML}
                </HTMLArea>     
            </div>
        </>
  )
}