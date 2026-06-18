package com.mst.agritech.service.punchout;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlFactory;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.xml.stream.XMLInputFactory;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Builds and parses cXML 1.2 PunchOut messages (Ariba / Coupa / Jaggaer compatible).
 * Inbound parsing disables DTD/external entities to prevent XXE.
 */
@Component
@Slf4j
public class CxmlMessageBuilder {

    private static final String CXML_DTD =
            "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd";

    private final XmlMapper xmlMapper;

    public CxmlMessageBuilder() {
        XMLInputFactory inputFactory = XMLInputFactory.newFactory();
        // Security: never resolve DTDs or external entities from inbound buyer XML
        inputFactory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        inputFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        XmlFactory xmlFactory = XmlFactory.builder().xmlInputFactory(inputFactory).build();
        this.xmlMapper = new XmlMapper(xmlFactory);
    }

    public JsonNode parse(String cxml) {
        try {
            return xmlMapper.readTree(cxml.getBytes());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Malformed cXML: " + ex.getMessage(), ex);
        }
    }

    /** Reads a nested text value, e.g. path("Header","From","Credential","Identity"). */
    public String text(JsonNode root, String... path) {
        JsonNode node = root;
        for (String segment : path) {
            if (node == null) return null;
            node = node.get(segment);
        }
        return node == null ? null : node.asText(null);
    }

    public String attr(JsonNode node, String name) {
        if (node == null) return null;
        JsonNode v = node.get(name);
        return v == null ? null : v.asText(null);
    }

    // ── Outbound message construction ───────────────────────────────

    public String successSetupResponse(String startPageUrl) {
        return header() +
                "<cXML payloadID=\"" + payloadId() + "\" timestamp=\"" + timestamp() + "\" xml:lang=\"en-US\">\n" +
                "  <Response>\n" +
                "    <Status code=\"200\" text=\"OK\"/>\n" +
                "    <PunchOutSetupResponse>\n" +
                "      <StartPage>\n" +
                "        <URL>" + escape(startPageUrl) + "</URL>\n" +
                "      </StartPage>\n" +
                "    </PunchOutSetupResponse>\n" +
                "  </Response>\n" +
                "</cXML>\n";
    }

    public String errorResponse(int code, String message) {
        return header() +
                "<cXML payloadID=\"" + payloadId() + "\" timestamp=\"" + timestamp() + "\" xml:lang=\"en-US\">\n" +
                "  <Response>\n" +
                "    <Status code=\"" + code + "\" text=\"" + escape(message) + "\">" + escape(message) + "</Status>\n" +
                "  </Response>\n" +
                "</cXML>\n";
    }

    public String header() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<!DOCTYPE cXML SYSTEM \"" + CXML_DTD + "\">\n";
    }

    public String payloadId() {
        return System.currentTimeMillis() + "." + UUID.randomUUID() + "@mst.co.zw";
    }

    public String timestamp() {
        return OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    public String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
