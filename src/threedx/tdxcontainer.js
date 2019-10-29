import React from 'react';
const styles = {
    tdxplayer: {
        backgroundColor: `#ccc`,
        position: `absolute`,
        left: `0px`,
        bottom: `0px`,
        width: `100%`,
        height: `100%`,
        zIndex: `1`
    }
}
export default class TdxContainer extends React.Component {
    render () {
        return (
            <div 
            id="tdxplayer-container"
            style={styles.tdxplayer} />
        )
    }
} 