export const grammar = `
<grammar root="author">
    <rule id="author">
        <ruleref uri="#quotes"/>
            <tag>out.quotes=rules.quotes;</tag>
    </rule>
    <rule id ="quotes">
        <one-of>
            <item>to do is to be<tag>out='Socrates';</tag></item>
            <item>to be is to do<tag>out='Sartre';</tag></item>
            <item>do be do be do<tag>out='Sinatra';</tag></item>
        </one-of>
    </rule>
</grammar>
`