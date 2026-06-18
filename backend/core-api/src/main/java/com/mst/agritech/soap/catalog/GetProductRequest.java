package com.mst.agritech.soap.catalog;

import jakarta.xml.bind.annotation.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@XmlRootElement(name = "GetProductRequest", namespace = CatalogNamespace.NS)
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GetProductRequest", namespace = CatalogNamespace.NS,
        propOrder = {"sku", "username", "password"})
public class GetProductRequest {
    @XmlElement(namespace = CatalogNamespace.NS, required = true)
    private String sku;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String username;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String password;
}
