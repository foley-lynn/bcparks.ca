import React from "react"
import { Paper, Container } from "@material-ui/core"
import Heading from "./heading"

export default function AccessibilityDetails({ data }) {
  return (
    <div id="accessibility-details-container">
      <Paper elevation={0}>
        <Heading title="Accessibility" />
        <Container>
          <p>{data}</p>
        </Container>
      </Paper>
    </div>
  )
}
