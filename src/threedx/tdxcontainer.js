import React from 'react';
import TdxLoader from './tdxloader';
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
    constructor(props) {
        super(props);
        // useless constructor
    }

    componentDidMount() {
        this.tdx = TdxLoader( this.tdxRootElement );

        window.addEventListener("tdxEvent", (evt) => {
            //this.tdxEventHandler(evt)
            this.props.onTdxEvent(evt.detail);
        });
    }

    tdxEventHandler(evt) {
        //console.dir(evt);
        this.props.onTdxEvent(evt.detail);
        /*
        switch(evt.detail.name) {
            case 'TDXONINITIALIZED':
                //tdxOnInitiliazed();
                this.props.onTdxEvent(evt);
                break;
            default:
                //
        }
        */
    }

    render () {
        return (
            <div 
            id="tdxplayer-container"
            style={styles.tdxplayer}
            ref={element => this.tdxRootElement = element}
             />
        )
    }
} 