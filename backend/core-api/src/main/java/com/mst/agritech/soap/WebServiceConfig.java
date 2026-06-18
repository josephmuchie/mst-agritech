package com.mst.agritech.soap;

import com.mst.agritech.soap.catalog.*;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.config.annotation.WsConfigurerAdapter;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;

/**
 * Exposes the product catalog as a SOAP 1.1 web service so third-party procurement
 * systems (Ariba, Oracle, SAP) can pull the catalog. WSDL is published at
 * {@code /soap/catalog.wsdl} and the endpoint at {@code /soap}.
 */
@EnableWs
@Configuration
public class WebServiceConfig extends WsConfigurerAdapter {

    @Bean
    public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet(ApplicationContext ctx) {
        MessageDispatcherServlet servlet = new MessageDispatcherServlet();
        servlet.setApplicationContext(ctx);
        servlet.setTransformWsdlLocations(true);
        return new ServletRegistrationBean<>(servlet, "/soap/*");
    }

    @Bean(name = "catalog")
    public DefaultWsdl11Definition catalogWsdl11Definition(XsdSchema catalogSchema) {
        DefaultWsdl11Definition definition = new DefaultWsdl11Definition();
        definition.setPortTypeName("CatalogPort");
        definition.setLocationUri("/soap");
        definition.setTargetNamespace(CatalogNamespace.NS);
        definition.setSchema(catalogSchema);
        return definition;
    }

    @Bean
    public XsdSchema catalogSchema() {
        return new SimpleXsdSchema(new ClassPathResource("xsd/catalog.xsd"));
    }

    @Bean
    public Jaxb2Marshaller catalogMarshaller() {
        Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
        marshaller.setClassesToBeBound(
                GetProductsRequest.class,
                GetProductsResponse.class,
                GetProductRequest.class,
                GetProductResponse.class,
                SoapProduct.class);
        return marshaller;
    }
}
