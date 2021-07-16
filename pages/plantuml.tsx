import { FC, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import plantUmlEncoder from 'plantuml-encoder'

import LayoutComponent from '../components/LayoutComponent';

const urlbase = "http://www.plantuml.com/plantuml/img/";


const PlantumlComponent: FC=()=>{
    const [umltext, setUmltext] = useState('A -> B: Hello');
    const [umlImage, setUmlImage] = useState<string>('');
    const handleExecute = async()=>{
        let url = urlbase + plantUmlEncoder.encode(umltext);
        setUmlImage(url);
    };
    return (
        <LayoutComponent title="PlantUML" page="plantuml" content={<>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <p>PlantUML</p>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="plantuml-text"
                        multiline
                        variant="outlined"
                        value={umltext}
                        onChange={(e)=>{setUmltext(e.target.value); }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        id="button"
                        variant="outlined"
                        color="primary"
                        onClick={handleExecute}>
                            Run
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Paper>
                        <img src={umlImage}/>
                    </Paper>
                </Grid>
            </Grid>
        </>}/>
    );
}
export default PlantumlComponent;