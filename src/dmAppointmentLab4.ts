import { MachineConfig, send, Action, assign, actions } from "xstate";


export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}



function say_ask_nomatch_timeout(say_this: Action<SDSContext, SDSEvent>, help_message: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({ 
        initial: 'prompt',
        states: {
            prompt: {
                entry: say_this,

                on: { ENDSPEECH: 'ask1' }
            },
            ask1: {
                entry: [send('LISTEN'), send ('TIMEOUT1', {delay: 4500, id: 'time1'})]
            },
            ask2: {
                entry: [send('LISTEN'), send ('TIMEOUT2', {delay: 4500, id: 'time2'})]
            },
            ask3: {
                entry: [send('LISTEN'), send ('TIMEOUT3', {delay: 4500, id: 'time3'})]
            },
            ask4: {
                entry: [send('LISTEN'), send ('TIMEOUT4', {delay: 4500, id: 'time4'})]
            },
            nomatch: {
                entry: say('Sorry, I did not manage to understand this one. Please repeat.'),
                on: {ENDSPEECH: "ask2"}
            },
            timeout1: {
                entry: say('I did not hear you this time, please speak louder.'),
                on: {ENDSPEECH: "ask2"}
            },
            timeout2: {
                entry: say('I still cannot hear you, please try again.'),
                on: {ENDSPEECH: "ask3"}
            },
            timeout3: {
                entry: say('Sorry, still nothing.'),
                on: {ENDSPEECH: "ask4"}
            },
            timeout4: {
                //Add idle state after 3 reprompts//
                entry: say('Returning to idle.'),
                on: {ENDSPEECH: "idle"}
            },
            idle:{
                type: 'final'
            },
            to_do:{
                entry: say('Sorry, this tool has not been developed yet. I will now return to idle state.'),
                on: {ENDSPEECH: 'idle'}
            },
            specific:{
                entry: say("Please be more specific"),
                on: {ENDSPEECH: "ask2"}
            },
            canceled:{
                entry: say("Your appointment has been canceled. I will now returnto idle state.")
            },
            help:{
                entry: say(help_message),
                on: {ENDSPEECH: "ask2"}
            }
        }
    })
}

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://rafalappointment.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json()); 

const grammar: { [index: string]: { person?: string, day?: string, time?: string, help?: string } } = {
    "John": { person: "John Appleseed" },
    "John Appleseed": { person: "John Appleseed" },
    "Jack": { person: "Jack Jackson" },
    "Jack Jackson": { person: "Jack Jackson" },
    "Liana": { person: "Liana Jelena" },
    "Liana Jelena": { person: "Liana Jelena" },
    "Natalie": { person: "Natalie Portman" },
    "Natalie Portman": { person: "Natalie Portman" },
    "Bruce": { person: "Bruce W" },
    "Bob": { person: "Bob the builder" },
    "Bob the builder": { person: "Bob the builder" },
    "Shrek": { person: "Shrek from the swamp" },
    "Shrek from the swap": { person: "Shrek from the swamp" },

    "on Monday": {day: "Monday" },
    "Monday": {day: "Monday" },
    "on Tuesday": {day: "Tuesday" },
    "Tuesday": {day: "Tuesday" },
    "on Wednesday": {day: "Wednesday" },
    "Wednesday": {day: "Wednesday" },
    "on Thursday": {day: "Thursday" },
    "Thursday": {day: "Thursday" },
    "on Friday": {day: "Friday" },
    "Friday": {day: "Friday" },
    "on Satudary": {day: "Satuday" },
    "Satudary": {day: "Satuday" },
    "on Sunday": {day: "Sunday" },
    "Sunday": {day: "Sunday" },

    "10": { time: "10:00" },
    "at 10": { time: "10:00" },
    "ten": { time: "10:00" },
    "at ten": { time: "10:00" },
    "11": { time: "11:00" },
    "eleven": { time: "11:00" },
    "at 11": { time: "11:00" },
    "at eleven": { time: "11:00" },
    "12": { time: "12:00" },
    "twelve": { time: "12:00" },
    "at 12": { time: "12:00" },
    "at twelve": { time: "12:00" },
    "13": { time: "13:00" },
    "thirteen": { time: "13:00" },
    "at 13": { time: "13:00" },
    "at thirteen": { time: "13:00" },
    "14": { time: "14:00" },
    "fourteen": { time: "14:00" },
    "at 14": { time: "14:00" },
    "at fourteen": { time: "14:00" },
    "15": { time: "15:00" },
    "fifteen": { time: "15:00" },
    "at 15": { time: "15:00" },
    "at fifteen": { time: "15:00" },
    "16": { time: "16:00" },
    "sixteen": { time: "16:00" },
    "at 16": { time: "16:00" },
    "at sixteen": { time: "16:00" },
    "17": { time: "17:00" },
    "seventeen": { time: "17:00" },
    "at 17": { time: "17:00" },
    "at seventeen": { time: "17:00" },
    "18": { time: "18:00" },
    "eighteen": { time: "18:00" },
    "at 18": { time: "18:00" },
    "at eighteen": { time: "18:00" },
    "19": { time: "19:00" },
    "nineteen": { time: "19:00" },
    "at 19": { time: "19:00" },
    "at nineteen": { time: "19:00" },
    "20": { time: "20:00" },
    "twenty": { time: "20:00" },
    "at 20": { time: "20:00" },
    "at twenty": { time: "20:00" },


    "help": {help: "help"},
    "help me": {help: "help"},
    "Help": {help: "help"},
    "Help me": {help: "help"},
}

const boolean_grammar: {[index: string]: {agreement?: boolean, disagreement?: boolean, uncertain?: string}} = {
    "yes": {agreement: Boolean(true)},
    "of course": {agreement: Boolean(true)},
    "sure": {agreement: Boolean(true)},
    "absolutely": {agreement: Boolean(true)},
    "yes please": {agreement: Boolean(true)},
    "no": {disagreement: Boolean(false)},
    "no way": {disagreement: Boolean(false)},
    "absolutely not": {disagreement: Boolean(false)},
    "never": {disagreement: Boolean(false)},
    "maybe": {uncertain: "unsure"},
    "perhaps": {uncertain: "unsure"},
    "I don't know": {uncertain: "unsure"},
    "probably": {uncertain: "unsure"},
}

const {cancel} = actions

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    
    initial: 'start_point',
    states: {
        start_point:{
            id: 'starting_poing',
            on: {
                CLICK: 'appointment'
            }
        },
        appointment:{
            initial: 'prompt',
            on:{ ENDSPEECH: 'who'
            },
            states:{
                prompt:{
                    entry: say("Let's create an appointment.")
                }
            }
        },
            who: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "person" in (grammar[context.recResult] || {}),
                        actions: [assign((context) => { return { person: grammar[context.recResult].person } }), cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "day"},

                        {
                        cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"
                        },

                    {target: ".nomatch" }],
                    
                        TIMEOUT1: '.timeout1',
                        TIMEOUT2: '.timeout2',
                        TIMEOUT3: '.timeout3',
                        TIMEOUT4: '.timeout4'
                    
                },
                ...say_ask_nomatch_timeout(say('Who are you meeting with?'), "Please specify the name of the person you are planning to meet up with. Pick someone from your contacts list.")
            },
            day: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "day" in (grammar[context.recResult] || {}),
                        actions: [assign((context) => {return{ day: grammar[context.recResult].day}}), cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "length"
                    },

                    {
                        cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"
                    },

                    {actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(say('On which day is your meating?'), "You need to specify the day on which you meeting is to be held. Please pick a day of the week. ") //Can add name specification
            },
            length: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "whole_day"},

                        {cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "time"},

                        {cond: (context) => "uncertain" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".specific"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target:".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'

                    },
                
                    ...say_ask_nomatch_timeout(say('Will it take the whole day?'), "You need to specify whether your meeting will take the whole day so that I can book it accordingly. Please answer with yes or no.")
            },
            time: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{

                    cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: [assign((context) => {return{ time: grammar[context.recResult].time}}), cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: "repetition"},

                    {cond: (context) => "help" in (grammar[context.recResult] || {}),
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".help"},

                    {
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".nomatch"
                    }],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(say('At what time is your meeting?'), "You need to specify the time when your meeting will start so that I can book it accordingly. Please tell me the time in military notation or, in other words, 24-hours format.")
            },
            whole_day: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "confirmation"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".canceled"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {
                    actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                    target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(send((context) => ({
                    type: "SPEAK",
                    value: `Just to confirm, do you want me to make an appointment with ${context.person} on ${context.day} for the whole day?`})), 
                    "This is just to confirm the details of your meeting, please say 'no' if you want to cancel it and 'yes' if you want to confirm the meeting.")
                },
            repetition: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: "confirmation"},
                        
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".canceled"},

                        {cond: (context) => "unsure" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".specific"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(send((context) => ({
                    type: "SPEAK",
                    value: `Just to confirm, do you want me to make an appointment with ${context.person} on ${context.day} at ${context.time}?`})),
                     "This is just to confirm the details of your meeting, please say 'no' if you want to cancel it and 'yes' if you want to confirm it.") 
                },
            confirmation: {
                initial: "prompt" ,
                on: {
                     RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".to_do"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".idle"},
                        {
                        cond: (context) => "unsure" in (boolean_grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".specific"},

                        {cond: (context) => "help" in (grammar[context.recResult] || {}),
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".help"},

                    {
                        actions: [cancel('time1'), cancel('time2'), cancel('time3'), cancel('time4')],
                        target: ".nomatch"}],

                    TIMEOUT1: '.timeout1',
                    TIMEOUT2: '.timeout2',
                    TIMEOUT3: '.timeout3',
                    TIMEOUT4: '.timeout4'
                },
                ...say_ask_nomatch_timeout(say('Your appointment has been scheduled! Do you want me to add it to your to do item?'), 
                "The appointment tool has not yet been developed, and I only need to ask this as a formality, please say yes.")
                }
            },
        }
)