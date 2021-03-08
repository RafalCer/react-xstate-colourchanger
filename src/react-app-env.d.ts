/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;
    person: string;
    day: string;
    time: string;
    task: any;
    intentResult: any;
    HouseCommand: any;
    AppointmentCommand: any;
    srgs_name: string;
    srgs_day: string;
    srgs_time: string;
    srgs_help: string;
    srgs_yes_no: string


}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string }
    | { type: 'TIMEOUT1' }
    | { type: 'TIMEOUT2' }
    | { type: 'TIMEOUT3' }
    | { type: 'TIMEOUT4' }
