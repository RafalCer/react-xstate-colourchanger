import { MachineConfig, send, Action, assign } from "xstate";


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
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

const grammar: { [index: string]: { person?: string, day?: string, time?: string } } = {
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
    "Shrek from the swap": { person: "Shrek" },

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

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    
    initial: 'start_point',
    states: {
        start_point:{
            on: {
                CLICK: 'choice_of_tool'
            }
        },
        choice_of_tool:{
            id: 'make_a_choice',
            initial: "prompt",
            on: {
                RECOGNISED:[{
                    actions: assign((context) => { return { task: context.recResult } }),
                    target: 'choice'},
                
                {target: ".nomatch"}]
            },
            states:{
                prompt: { entry: say("What would you like to do?"),
                        on: {ENDSPEECH: 'ask'}
                },
                ask: {
                    entry: listen()
                },
                nomatch: { entry: say("Sorry, I didn't quite get you. Could you please repeat?"),
                on: {ENDSPEECH: 'ask'}}
            }
        },
        choice:{
            invoke: {
                id: 'rasaApi',
                src: (context, event) =>  nluRequest(context.task),
                onDone:{
                    target: 'tool',
                    actions:[
                        assign((context, event) => { return { intentResult: event.data.intent.name} }),
                        (context:SDSContext, event:any) => console.log(event.data)]
                },
                onError:{
                    target: 'choice_of_tool',
                    actions: (context, event) => console.log(event.data)

                }

            }

        },
        tool:{
            initial: 'prompt',
            on:{
                ENDSPEECH:[{
                    cond: (context) => context.intentResult === 'to_do_item',
                    target: 'to_do_item'},
                    {cond: (context) => context.intentResult === 'appointment',
                    target: 'appointment'},
                    {cond: (context) => context.intentResult === 'timer',
                    target: 'timer'},
                {target:'.nomatch'}]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Ok, let's see if I can help you with ${context.task}.`}))},
                nomatch: {
                    entry: say("Excuse me, I haven't yet learned such task. Let's try again."),
                    on: {ENDSPEECH: '#make_a_choice'}
                        
                    }
                        
                }

        },
        timer: {
            initial: 'prompt',
            on: {ENDSPEECH: 'choice_of_tool'},
            states:{
                prompt:{
                    entry: say("Welcome to the timer tool! Sorry, this tool has not yet been developed.")
                }
            }
        },
        to_do_item: {
            initial: 'prompt',
            on: {ENDSPEECH: 'choice_of_tool'},
            states:{
                prompt:{
                    entry: say("Welcome to the to do item tool! Sorry, this tool has not yet been developed.")
                }
            }
        },
        appointment:{
            initial: 'prompt',
            on:{ ENDSPEECH: 'who'
            },
            states:{
                prompt:{
                    entry: say("Welcome to the appointment tool! Let's create an appointment.")
                }
            }
        },
            who: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "person" in (grammar[context.recResult] || {}),
                        actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                        target: "day"},
    
                    { target: ".nomatch" }]
                },
                states: {
                    prompt: {
                        entry: say("Who are you meeting with?"),
                        on: { ENDSPEECH: "ask" }
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: { entry: send((context) => ({
                            type: "SPEAK",
                            value: `Sorry, I don't know them. Please choose someone from your contacts list.`})),
                            on: {ENDSPEECH: "ask"}}
        
                    }
            },
            day: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "day" in (grammar[context.recResult] || {}),
                        actions: assign((context) => {return{ day: grammar[context.recResult].day}}),
                        target: "length"
                    },
                    {target: ".nomatch"}]
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `OK. ${context.person}. On which day is your meeting?`})),
                        on: {ENDSPEECH: "ask"}
                        },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}
                    }
                }
            },
            length: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "whole_day"},

                        {cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: "time"},

                        {cond: (context) => "uncertain" in (boolean_grammar[context.recResult] || {}),
                        target: ".specific"},

                    {target:".nomatch"}]

                    },
                states: {
                    prompt: {
                        entry: say("Will it take the whole day?"),
                        on: {ENDSPEECH: "ask"}
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I did not understand you this time."),
                    on: {ENDSPEECH: "ask"}
                    },
                    specific: {
                        entry: say("please be more specific."),
                    on: {ENDSPEECH: "ask"},
                    }
                }
            },
            time: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "time" in (grammar[context.recResult] || {}),
                        actions: assign((context) => {return{ time: grammar[context.recResult].time}}),
                        target: "repetition"
                        },
                    {
                    target: ".nomatch"
                    }]
                },
                states: {
                    prompt: {
                        entry: say("What time is your meeting?"),
                        on: {ENDSPEECH: "ask"}
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}}
                    }
            },
            whole_day: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "confirmation"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: ".canceled"},

                    {target: ".nomatch"}]
                },
                states:{
                    prompt:{
                        entry: send((context) => ({
                            type: "SPEAK",
                            value:`Do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`})),
                        on: {ENDSPEECH: "ask"}

                    },
                    ask: {
                        entry: listen()
                    },
                    canceled: {
                        entry: say("The appointment has been canceled."),
                        on: {ENDSPEECH: '#make_a_choice'}

                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}}
                }
            },
            repetition: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "confirmation"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: ".canceled"},
                        {cond: (context) => "unsure" in (boolean_grammar[context.recResult] || {}),
                        target: ".specific"},
                    {target: ".nomatch"}]
                },
                states:{
                    prompt:{
                        entry: send((context) => ({
                            type: "SPEAK",
                            value:`Do you want me to create an appointment with ${context.person} on ${context.day} at ${context.time}?`})),
                            on: {ENDSPEECH: "ask"}
                    },
                    canceled: {
                        entry: say("The appointment has been cancell\ed."),
                        on: {ENDSPEECH: '#make_a_choice'}
                    },
                    ask: {
                        entry: listen()
                    },
                    specific:{
                        entry: say("Please be more specific."),
                        on: {ENDSPEECH: 'ask'}
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}}}
            },
            confirmation: {
                initial: "prompt" ,
                on: {
                     RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "to_do_item"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: "#make_a_choice"},
                        {
                        cond: (context) => "unsure" in (boolean_grammar[context.recResult] || {}),
                        target: ".specific"},

                    {target: ".nomatch"}]
                },
                states: {
                    prompt: {
                        entry: say("Your appointment has been created! Would you like to add it to your to do list? "),
                        on: {ENDSPEECH: 'ask'}
                    },
                    ask: {entry: listen(),
                    },
                    nomatch:{
                        entry: say("Sorry, I did not get you.")
                    },
                    specific:{
                        entry: say("Please be more specific"),
                        on: {ENDSPEECH: 'ask'}
                    }
                }
            },
        }
})