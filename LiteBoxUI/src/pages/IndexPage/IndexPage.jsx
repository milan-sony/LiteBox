import React from 'react'

function IndexPage() {
    return (
        <fieldset className="fieldset">
            <legend className="fieldset-legend">Pick a file</legend>
            <input type="file" className="file-input" />
            <label className="label">Max size 2MB</label>
        </fieldset>
    )
}

export default IndexPage